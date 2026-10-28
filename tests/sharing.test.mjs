import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';
const compiled = ts.transpileModule(fs.readFileSync('lib/sharing.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function setup(key = 'public-test-key') {
  const scripts = [];
  const window = { setTimeout, clearTimeout };
  const navigator = {};
  const document = {
    createElement: () => ({ remove() { this.removed = true; }, style: {}, focus() {}, select() {} }),
    head: { appendChild: (script) => scripts.push(script) },
    body: { appendChild() {} },
    execCommand: () => true,
  };
  const context = { exports: {}, process: { env: { NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: key } }, window, navigator, document, clearTimeout, URL };
  vm.runInNewContext(compiled, context);
  return { ...context, api: context.exports, scripts };
}
test('missing public key rejects without loading a script', async () => {
  const s = setup('');
  await assert.rejects(s.api.prepareKakao(), /설정/);
  assert.equal(s.scripts.length, 0);
});
test('concurrent loads share one script; initialization runs once; share dispatch is synchronous', async () => {
  const s = setup();
  let initialized = false, initCount = 0, payload;
  const a = s.api.prepareKakao(), b = s.api.prepareKakao();
  assert.equal(a, b);
  assert.equal(s.scripts.length, 1);
  assert.match(s.scripts[0].integrity, /^sha384-/);
  s.window.Kakao = { isInitialized: () => initialized, init: () => { initialized = true; initCount++; }, Share: { sendDefault: (p) => { payload = p; } } };
  s.scripts[0].onload();
  await a;
  await s.api.prepareKakao();
  assert.equal(initCount, 1);
  s.api.sendKakaoInvite('민지', 'https://example.com/?invite=1&from=test');
  assert.equal(payload.content.link.webUrl, 'https://example.com/?invite=1&from=test');
  assert.equal(payload.content.imageUrl, 'https://example.com/assets/major-wide.png');
  assert.match(payload.content.title, /민지/);
});
test('failed SDK load cleans up and allows a retry', async () => {
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
test('uninitialized SDK never dispatches', () => {
  const s = setup();
  assert.throws(() => s.api.sendKakaoInvite('친구', 'https://example.com'), /준비/);
});
test('clipboard denial falls back; total failure is reported', async () => {
  const s = setup();
  let copies = 0;
  s.navigator.clipboard = { writeText: async () => { throw new Error('denied'); } };
  s.document.execCommand = () => { copies++; return true; };
  await s.api.copyText('https://example.com');
  assert.equal(copies, 1);
  s.document.execCommand = () => false;
  await assert.rejects(s.api.copyText('https://example.com'), /직접 복사/);
});
