import type { Element } from "@/lib/saju";

/**
 * 오행 colour classes. Written out in full so Tailwind can see them; the
 * tokens live in globals.css (element-*).
 */
export const ELEMENT_FILL: Record<Element, string> = {
  목: "bg-element-wood-yang",
  화: "bg-element-fire-yang",
  토: "bg-element-earth-yang",
  금: "bg-element-metal-yang",
  수: "bg-element-water-yang",
};

export type TypeTone = { bg: string; ring: string };

/**
 * 유형 card tone per 일간 천간: the element's hue, deeper for 양 (갑·병·무·경·임),
 * lighter for 음 (을·정·기·신·계).
 */
const TONES: Record<string, TypeTone> = {
  갑: { bg: "bg-element-wood-yang", ring: "border-element-wood-ring" },
  을: { bg: "bg-element-wood-eum", ring: "border-element-wood-ring" },
  병: { bg: "bg-element-fire-yang", ring: "border-element-fire-ring" },
  정: { bg: "bg-element-fire-eum", ring: "border-element-fire-ring" },
  무: { bg: "bg-element-earth-yang", ring: "border-element-earth-ring" },
  기: { bg: "bg-element-earth-eum", ring: "border-element-earth-ring" },
  경: { bg: "bg-element-metal-yang", ring: "border-element-metal-ring" },
  신: { bg: "bg-element-metal-eum", ring: "border-element-metal-ring" },
  임: { bg: "bg-element-water-yang", ring: "border-element-water-ring" },
  계: { bg: "bg-element-water-eum", ring: "border-element-water-ring" },
};

/** The original navy card, for anything that isn't a 천간. */
const FALLBACK: TypeTone = { bg: "bg-brand-secondary", ring: "border-brand-secondary-light" };

/** `dayMaster`: the 일간 name, e.g. "갑목" — its first syllable is the 천간. */
export function typeTone(dayMaster: string): TypeTone {
  return TONES[dayMaster.charAt(0)] ?? FALLBACK;
}
