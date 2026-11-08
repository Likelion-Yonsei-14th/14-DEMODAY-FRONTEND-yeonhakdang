/** `npm test` — the Kakao SDK loader, invite dispatch and clipboard fallback. */
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

import ts from "typescript";

// sharing.ts reads `window` and the env at load, so it runs in a fresh sandbox per test.
const compiled = ts.transpileModule(fs.readFileSync("lib/sharing.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

type FakeScript = { integrity?: string; removed?: boolean; onload: () => void; onerror: () => void };
type Payload = { content: { title: string; imageUrl: string; link: { webUrl: string } } };
type Api = {
  kakaoConfigured: boolean;
  usesMobileStoryShare: (ua: string, touchPoints?: number) => boolean;
  prepareKakao: () => Promise<void>;
  sendKakaoInvite: (name: string, url: string, image: string) => unknown;
  copyText: (value: string) => Promise<void>;
  shareImageFile: (file: File) => Promise<"shared" | "cancelled" | "unsupported">;
};

function setup(key = "public-test-key") {
  const scripts: FakeScript[] = [];
  const window: Record<string, unknown> = { setTimeout, clearTimeout };
  const navigator: Record<string, unknown> = {};
  const document = {
    createElement: () => ({ removed: false, remove() { this.removed = true; }, style: {}, focus() {}, select() {} }),
    head: { appendChild: (script: FakeScript) => scripts.push(script) },
    body: { appendChild() {} },
    execCommand: (): boolean => true,
  };
  const context = { exports: {} as Api, process: { env: { NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: key } }, window, navigator, document, clearTimeout, URL, DOMException };
  vm.runInNewContext(compiled, context);
  return { window, navigator, document, api: context.exports, scripts };
}

test("missing public key rejects without loading a script", async () => {
  const s = setup("");
  assert.equal(s.api.kakaoConfigured, false);
  await assert.rejects(s.api.prepareKakao(), /설정/);
  assert.equal(s.scripts.length, 0);
});

test("concurrent loads share one script; initialization runs once; share dispatch is synchronous", async () => {
  const s = setup();
  assert.equal(s.api.kakaoConfigured, true);
  let initialized = false;
  let initCount = 0;
  let payload: Payload | undefined;
  const a = s.api.prepareKakao();
  const b = s.api.prepareKakao();
  assert.equal(a, b);
  assert.equal(s.scripts.length, 1);
  assert.match(s.scripts[0].integrity ?? "", /^sha384-/);
  s.window.Kakao = {
    isInitialized: () => initialized,
    init: () => { initialized = true; initCount++; },
    Share: { sendDefault: (p: Payload) => { payload = p; } },
  };
  s.scripts[0].onload();
  await a;
  await s.api.prepareKakao();
  assert.equal(initCount, 1);
  s.api.sendKakaoInvite("민지", "https://example.com/?invite=abc", "/assets/ilgan/card-gap.jpg");
  assert.equal(payload?.content.link.webUrl, "https://example.com/?invite=abc");
  assert.equal(payload?.content.imageUrl, "https://example.com/assets/ilgan/card-gap.jpg");
  assert.match(payload?.content.title ?? "", /민지/);
});

test("failed SDK load cleans up and allows a retry", async () => {
  const s = setup();
  const first = s.api.prepareKakao();
  s.scripts[0].onerror();
  await assert.rejects(first, /네트워크/);
  assert.equal(s.scripts[0].removed, true);
  const second = s.api.prepareKakao();
  assert.equal(s.scripts.length, 2);
  s.scripts[1].onerror();
  await assert.rejects(second);
});

test("uninitialized SDK never dispatches", () => {
  const s = setup();
  assert.throws(() => s.api.sendKakaoInvite("친구", "https://example.com", "/assets/ilgan/card-gap.jpg"), /준비/);
});

test("clipboard denial falls back; total failure is reported", async () => {
  const s = setup();
  let copies = 0;
  s.navigator.clipboard = { writeText: async () => { throw new Error("denied"); } };
  s.document.execCommand = () => { copies++; return true; };
  await s.api.copyText("https://example.com");
  assert.equal(copies, 1);
  s.document.execCommand = () => false;
  await assert.rejects(s.api.copyText("https://example.com"), /직접 복사/);
});


test("image sharing returns unsupported when file sharing is missing or rejected", async () => {
  const s = setup(); const file = {} as File;
  assert.equal(await s.api.shareImageFile(file), "unsupported");
  s.navigator.canShare = () => true;
  assert.equal(await s.api.shareImageFile(file), "unsupported");
  let calls = 0;
  s.navigator.share = async () => { calls++; };
  s.navigator.canShare = () => false;
  assert.equal(await s.api.shareImageFile(file), "unsupported");
  s.navigator.canShare = () => { throw new Error("blocked capability check"); };
  assert.equal(await s.api.shareImageFile(file), "unsupported");
  assert.equal(calls, 0);
});

test("supported image sharing passes the PNG file to the OS picker", async () => {
  const s = setup(); const file = {} as File;
  let sent: { files: File[] } | undefined;
  s.navigator.canShare = () => true;
  s.navigator.share = async (payload: { files: File[] }) => { sent = payload; };
  assert.equal(await s.api.shareImageFile(file), "shared");
  assert.equal(sent?.files[0], file);
});

test("cancelling the share picker is distinct from unsupported sharing", async () => {
  const s = setup(); s.navigator.canShare = () => true;
  s.navigator.share = async () => { throw new DOMException("cancelled", "AbortError"); };
  assert.equal(await s.api.shareImageFile({} as File), "cancelled");
});

test("permission denial falls back instead of leaving an unhandled rejection", async () => {
  const s = setup(); s.navigator.canShare = () => true;
  s.navigator.share = async () => { throw new DOMException("blocked", "NotAllowedError"); };
  assert.equal(await s.api.shareImageFile({} as File), "unsupported");
});


test("desktop story sharing uses download even on a browser with file share support", () => {
  const s = setup();
  assert.equal(s.api.usesMobileStoryShare("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0"), false);
  assert.equal(s.api.usesMobileStoryShare("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Version/18 Safari/605.1.15"), false);
});

test("mobile story sharing keeps the native picker including desktop-style iPads", () => {
  const s = setup();
  assert.equal(s.api.usesMobileStoryShare("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)"), true);
  assert.equal(s.api.usesMobileStoryShare("Mozilla/5.0 (Linux; Android 15)"), true);
  assert.equal(s.api.usesMobileStoryShare("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 5), true);
});
