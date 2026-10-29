/** `npm test` — where 9-4 "Safari로 열기" sends each in-app browser, and which address it hands over. */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import {
  captureEntryUrl,
  detectApp,
  detectOs,
  entryUrl,
  externalBrowserPlan,
  resetEntryUrl,
} from "./externalBrowser.ts";

const UA = {
  kakaoIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.8.5",
  kakaoAndroid:
    "Mozilla/5.0 (Linux; Android 14; SM-S921N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.71 Mobile Safari/537.36;KAKAOTALK 2410850",
  instaIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 340.0.3.18.84 (iPhone15,2; iOS 17_5; ko_KR; ko; scale=3.00; 1179x2556; 621436519)",
  instaAndroid:
    "Mozilla/5.0 (Linux; Android 14; SM-S921N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.71 Mobile Safari/537.36 Instagram 340.0.0.22.109 Android (34/14; 480dpi; 1080x2340; samsung; SM-S921N; e1q; qcom; ko_KR; 621436519)",
  safari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  chrome:
    "Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.71 Mobile Safari/537.36",
};

const URL_ = "https://yeonhakdang.com/?invite=abc123#1-2";

test("detects the OS and the in-app browser", () => {
  assert.equal(detectOs(UA.kakaoIos), "ios");
  assert.equal(detectOs(UA.kakaoAndroid), "android");
  assert.equal(detectOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "other");
  assert.equal(detectApp(UA.kakaoAndroid), "kakao");
  assert.equal(detectApp(UA.instaIos), "instagram");
  assert.equal(detectApp("Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/470.0]"), "instagram");
  assert.equal(detectApp(UA.safari), "none");
});

test("카카오톡 iOS: openExternal scheme, Safari copy", () => {
  const plan = externalBrowserPlan(UA.kakaoIos, URL_);
  assert.equal(plan.href, `kakaotalk://web/openExternal?url=${encodeURIComponent(URL_)}`);
  assert.equal(plan.label, "Safari로 열기");
  assert.equal(plan.guide.text, "오른쪽 아래 메뉴 → Safari로 열기");
});

test("카카오톡 Android: openExternal scheme, ⋮ guide", () => {
  const plan = externalBrowserPlan(UA.kakaoAndroid, URL_);
  assert.equal(plan.href, `kakaotalk://web/openExternal?url=${encodeURIComponent(URL_)}`);
  assert.equal(plan.label, "브라우저로 열기");
  assert.deepEqual(plan.guide, { icon: "⋮", text: "오른쪽 아래 ⋮ → 다른 브라우저로 열기" });
});

test("인스타그램 Android: Chrome intent keeping the query, full URL as fallback", () => {
  const plan = externalBrowserPlan(UA.instaAndroid, URL_);
  assert.equal(
    plan.href,
    "intent://yeonhakdang.com/?invite=abc123#Intent;scheme=https;package=com.android.chrome;" +
      `S.browser_fallback_url=${encodeURIComponent(URL_)};end`,
  );
  assert.equal(plan.label, "브라우저로 열기");
  assert.equal(plan.guide.text, "오른쪽 위 ⋯ → 외부 브라우저에서 열기");
});

test("인스타그램 iOS: x-safari- scheme", () => {
  const plan = externalBrowserPlan(UA.instaIos, URL_);
  assert.equal(plan.href, `x-safari-${URL_}`);
  assert.equal(plan.label, "Safari로 열기");
  assert.equal(plan.guide.text, "오른쪽 위 ⋯ → 외부 브라우저에서 열기");
});

test("plain Safari / Chrome: nothing to try, only the guide", () => {
  const safari = externalBrowserPlan(UA.safari, URL_);
  assert.equal(safari.href, null);
  assert.equal(safari.label, "Safari로 열기");
  const chrome = externalBrowserPlan(UA.chrome, URL_);
  assert.equal(chrome.href, null);
  assert.equal(chrome.label, "브라우저로 열기");
  assert.equal(chrome.guide.text, "오른쪽 위 ⋯ 메뉴 → ‘다른 브라우저로 열기’");
});

function memoryStorage() {
  const map = new Map<string, string>();
  return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v) };
}

beforeEach(resetEntryUrl);

test("the invite link survives Prototype clearing the query and a refresh", () => {
  const tab = memoryStorage();
  captureEntryUrl("https://yeonhakdang.com/?invite=abc123", tab);
  assert.equal(entryUrl("https://yeonhakdang.com/"), "https://yeonhakdang.com/?invite=abc123");
  // Refresh: a new page (module state gone), the query already cleared.
  resetEntryUrl();
  captureEntryUrl("https://yeonhakdang.com/#1-2", tab);
  const handedOver = entryUrl("https://yeonhakdang.com/#1-2");
  assert.equal(handedOver, "https://yeonhakdang.com/?invite=abc123");
  const href = externalBrowserPlan(UA.kakaoIos, handedOver).href!;
  assert.equal(new URL(decodeURIComponent(href.split("url=")[1])).searchParams.get("invite"), "abc123");
});

test("a new link in the same tab replaces the saved one", () => {
  const tab = memoryStorage();
  captureEntryUrl("https://yeonhakdang.com/?invite=old", tab);
  resetEntryUrl();
  captureEntryUrl("https://yeonhakdang.com/?invite=new", tab);
  assert.equal(entryUrl(""), "https://yeonhakdang.com/?invite=new");
});

test("the PG return is not handed over (it would confirm the order again)", () => {
  captureEntryUrl("https://yeonhakdang.com/?checkoutOrder=o1&code=FAIL&message=x#7-3");
  assert.equal(entryUrl(""), "https://yeonhakdang.com/#7-3");
  resetEntryUrl();
  captureEntryUrl("https://yeonhakdang.com/?checkout=1&product=compat&plan=single");
  assert.equal(entryUrl(""), "https://yeonhakdang.com/?checkout=1&product=compat&plan=single");
});

test("storage that throws falls back to the module copy", () => {
  const broken = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  captureEntryUrl("https://yeonhakdang.com/?invite=abc123", broken);
  assert.equal(entryUrl(""), "https://yeonhakdang.com/?invite=abc123");
});
