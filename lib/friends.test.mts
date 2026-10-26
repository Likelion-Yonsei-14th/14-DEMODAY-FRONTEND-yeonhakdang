/** `npm test` — invite links and the 명단. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { addFriend, decodeInvite, encodeInvite, friendKey, type FriendInput } from "./friends.ts";

const 민지: FriendInput = {
  name: "민지",
  birth: "2008.11.09",
  calendar: 0,
  leapMonth: false,
  time: "",
  unknownTime: true,
};

test("초대 링크는 인코딩 → 디코딩하면 그대로", () => {
  assert.deepEqual(decodeInvite(encodeInvite(민지)), 민지);
  const withTime: FriendInput = { ...민지, name: "서준", calendar: 1, time: "오후 2시 30분", unknownTime: false };
  assert.deepEqual(decodeInvite(encodeInvite(withTime)), withTime);
});

test("초대 코드는 URL에 그대로 넣을 수 있다", () => {
  assert.match(encodeInvite(민지), /^[A-Za-z0-9_-]+$/);
});

test("깨진 · 예전 · 엉터리 초대 링크는 null", () => {
  assert.equal(decodeInvite(null), null);
  assert.equal(decodeInvite("1"), null);
  assert.equal(decodeInvite("not base64 !!"), null);
  assert.equal(decodeInvite(encodeInvite({ ...민지, birth: "2008.13.40" })), null);
  assert.equal(decodeInvite(encodeInvite({ ...민지, name: "  " })), null);
  assert.equal(decodeInvite(Buffer.from('{"n":"민지"}').toString("base64url")), null);
});

test("같은 친구는 한 번만, 처음 등록한 시각을 유지", () => {
  const once = addFriend([], 민지, 100);
  const twice = addFriend(once, { ...민지 }, 200);
  assert.equal(twice.length, 1);
  assert.equal(twice[0].addedAt, 100);
  assert.equal(addFriend(twice, { ...민지, birth: "2008.11.10" }, 300).length, 2);
});

test("시간을 모르면 시간 라벨은 키에서 빠진다", () => {
  assert.equal(friendKey({ ...민지, time: "오후 2시 30분" }), friendKey(민지));
});
