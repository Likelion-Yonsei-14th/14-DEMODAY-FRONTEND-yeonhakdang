/** `npm test` — GA stays off without an ID, never sees an invite code, and drops repeat screens. */
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

import ts from "typescript";

// analytics.ts reads the env at load, so it runs in a fresh sandbox per test.
const compiled = ts.transpileModule(fs.readFileSync("lib/analytics.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

type Api = {
  stripInvite: (url: string) => string;
  primeGa: () => void;
  startGa: () => void;
  trackScreen: (id: string, name: string) => void;
  trackShareClick: (method: string) => void;
  trackInviteOpen: () => void;
};

const INVITE = "https://yeonhak.example/?invite=7KeA7JiBLDIwMDguMTEuMDk&utm_source=kakao#1-2";

function setup(id = "G-TEST", href = "https://yeonhak.example/", referrer = "") {
  const url = new URL(href);
  const window: { location: unknown; dataLayer?: ArrayLike<unknown>[] } = {
    location: { href, origin: url.origin, pathname: url.pathname, search: url.search },
  };
  const context = { exports: {} as Api, process: { env: { NEXT_PUBLIC_GA_ID: id } }, window, document: { referrer }, URL, URLSearchParams };
  vm.runInNewContext(compiled, context);
  const commands = () => (window.dataLayer ?? []).map((args) => Array.from(args));
  return { api: context.exports, commands };
}

test("without an ID nothing reaches the data layer", () => {
  const s = setup("");
  s.api.primeGa();
  s.api.startGa();
  s.api.trackScreen("1-1", "1-1 랜딩");
  s.api.trackInviteOpen();
  assert.deepEqual(s.commands(), []);
});

test("stripInvite drops only the invite code", () => {
  const s = setup();
  assert.equal(s.api.stripInvite(INVITE), "https://yeonhak.example/?utm_source=kakao#1-2");
  assert.equal(s.api.stripInvite(""), "");
});

test("the first page_view's location and referrer carry no invite code", () => {
  const s = setup("G-TEST", INVITE, INVITE);
  s.api.trackScreen("1-2", "1-2 랜딩 · 초대 링크 진입");
  s.api.primeGa();
  const [[command, fields]] = s.commands() as [[string, Record<string, string>]];
  assert.equal(command, "set");
  assert.equal(fields.page_referrer, "https://yeonhak.example/?utm_source=kakao#1-2");
  assert.equal(fields.screen_id, "1-2");
  assert.doesNotMatch(JSON.stringify(s.commands()), /invite=|7KeA/);
});

test("events wait for startGa; a repeated screen is not sent twice", () => {
  const s = setup();
  s.api.trackScreen("1-1", "1-1 랜딩");
  s.api.trackInviteOpen();
  assert.deepEqual(s.commands(), []);
  s.api.primeGa();
  s.api.startGa();
  s.api.trackScreen("1-1", "1-1 랜딩");
  s.api.trackScreen("2-1", "2-1 정보 입력 · 빈 상태");
  s.api.trackScreen("2-1", "2-1 정보 입력 · 빈 상태");
  s.api.trackShareClick("kakao");
  const events = s.commands().filter(([c]) => c === "event").map(([, name, params]) => [name, params]);
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [
    ["invite_open", {}],
    ["page_view", { page_location: "https://yeonhak.example/#2-1", page_title: "2-1 정보 입력 · 빈 상태", screen_id: "2-1", screen_name: "2-1 정보 입력 · 빈 상태" }],
    ["share_click", { method: "kakao" }],
  ]);
});
