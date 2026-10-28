"use client";

/**
 * Share-card PNGs. html-to-image on its own inlines every @font-face on the
 * page — the Korean fonts come as ~620 unicode-range slices, ~14 s per card.
 * This embeds only the slices the card's own text needs (family, weight and
 * characters), and keeps each font file once per visit.
 */
import { toPng } from "html-to-image";

const fontFiles = new Map<string, Promise<string>>();

function dataUrl(url: string): Promise<string> {
  let file = fontFiles.get(url);
  if (!file) {
    file = fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(url))))
      .then((blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      }));
    // A failed fetch is retried next time rather than cached.
    file.catch(() => fontFiles.delete(url));
    fontFiles.set(url, file);
  }
  return file;
}

const family = (name: string) => name.trim().replace(/^["']|["']$/g, "");

/** "U+AC00-D7A3, U+0041, U+4??" → inclusive code point ranges. */
export function parseUnicodeRange(range: string): [number, number][] {
  return range.split(",").flatMap((part) => {
    const m = part.trim().match(/^U\+([0-9A-F?]+)(?:-([0-9A-F]+))?$/i);
    if (!m) return [];
    if (m[1].includes("?")) return [[parseInt(m[1].replace(/\?/g, "0"), 16), parseInt(m[1].replace(/\?/g, "F"), 16)]];
    const start = parseInt(m[1], 16);
    return [[start, m[2] ? parseInt(m[2], 16) : start]];
  });
}

/** Which family + weight draws which characters inside `node`. */
function glyphsInUse(node: HTMLElement): Map<string, Set<number>> {
  const used = new Map<string, Set<number>>();
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    const parent = text.parentElement;
    if (!parent || !text.textContent?.trim()) continue;
    const style = getComputedStyle(parent);
    for (const name of style.fontFamily.split(",")) {
      const key = `${family(name)}|${style.fontWeight}`;
      const set = used.get(key) ?? new Set<number>();
      for (const char of text.textContent) set.add(char.codePointAt(0)!);
      used.set(key, set);
    }
  }
  return used;
}

function fontFaces(): CSSFontFaceRule[] {
  const faces: CSSFontFaceRule[] = [];
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) faces.push(rule);
      else if ("cssRules" in rule) visit((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // A cross-origin stylesheet: its fonts are not the card's.
    }
  }
  return faces;
}

/** @font-face CSS for just the slices the card draws, with the files inlined. */
async function cardFontCSS(node: HTMLElement): Promise<string> {
  const used = glyphsInUse(node);
  const css = await Promise.all(
    fontFaces().map(async (face) => {
      const chars = used.get(`${family(face.style.getPropertyValue("font-family"))}|${face.style.getPropertyValue("font-weight") || "400"}`);
      if (!chars) return "";
      const range = face.style.getPropertyValue("unicode-range");
      if (range) {
        const ranges = parseUnicodeRange(range);
        if (![...chars].some((c) => ranges.some(([a, b]) => c >= a && c <= b))) return "";
      }
      let text = face.cssText;
      const base = face.parentStyleSheet?.href ?? document.baseURI;
      for (const [, raw] of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        if (raw.startsWith("data:")) continue;
        text = text.replace(raw, await dataUrl(new URL(raw, base).href));
      }
      return text;
    }),
  );
  return css.filter(Boolean).join("\n");
}

/** The card as a 3× PNG data URL (1080 wide for the 360-wide cards). */
export async function renderCard(node: HTMLElement): Promise<string> {
  const images = Array.from(node.querySelectorAll("img"));
  // The card sits off-screen, where lazy images never start loading: load them now.
  // Wait on load/error rather than decode(), which can stay pending for SVGs.
  for (const img of images) img.loading = "eager";
  const loaded = (img: HTMLImageElement) =>
    img.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
          setTimeout(resolve, 5000);
        });
  await Promise.all(images.map(loaded));
  await document.fonts.ready;
  return toPng(node, { pixelRatio: 3, backgroundColor: "#ffffff", fontEmbedCSS: await cardFontCSS(node) });
}
