import assert from "node:assert/strict";
import { test } from "node:test";
import { analysisProfile, profileToRestore, ProfileWriter, type AnalysisProfile, type ProfileSnapshot } from "./analysisProfile.ts";
import type { ProtoState } from "./proto.tsx";

const profile: AnalysisProfile = { name: "연학", birth: "2005.03.15", gender: 0, calendar: 0, leapMonth: false, time: "", unknownTime: true, analyzed: true, friends: [], rosterSeenAt: 0 };
const local = (patch: Partial<ProtoState> = {}) => ({ ...profile, account: null, loginPending: false, ...patch }) as ProtoState;
const remote: ProfileSnapshot = { accountId: "member", revision: 3, profile };

test("a fresh browser restores account data instead of uploading its empty local state", () => {
  assert.equal(profileToRestore(local({ analyzed: false, name: "", birth: "", loginPending: true }), remote), profile);
});
test("a completed guest analysis is adopted on login, but a different account's local data never is", () => {
  assert.equal(profileToRestore(local({ name: "게스트", loginPending: true }), remote)?.name, "게스트");
  assert.equal(profileToRestore(local({ name: "다른계정", account: "other", loginPending: true }), remote)?.name, "연학");
  assert.equal(profileToRestore(local({ account: "other" }), { ...remote, profile: null }), null);
});
test("adopting a guest analysis preserves the account roster and adds guest friends without duplicates", () => {
  const friend = { name: "친구", birth: "2005.01.01", calendar: 0 as const, leapMonth: false, time: "", unknownTime: true, addedAt: 1 };
  const saved = { ...remote, profile: { ...profile, friends: [friend] } };
  const result = profileToRestore(local({ loginPending: true, friends: [friend, { ...friend, name: "새친구", addedAt: 2 }] }), saved);
  assert.deepEqual(result?.friends.map((f) => f.name), ["친구", "새친구"]);
});
test("expired sessions retain analysis ownership and cannot adopt it into a different account", () => {
  const expired = local({ account: null, analysisOwner: "old-member", loginPending: true });
  assert.equal(profileToRestore(expired, { ...remote, profile: null }), null);
  assert.equal(profileToRestore(expired, remote), profile);
});
test("old local-only results can migrate to their own account, and snapshots exclude privileges", () => {
  const state = local({ account: "member", loggedIn: true, purchased: { compat: true, benefactor: true, charm: true } });
  assert.deepEqual(profileToRestore(state, { ...remote, profile: null }), profile);
  assert.equal("purchased" in analysisProfile(state), false);
  assert.equal("account" in analysisProfile(state), false);
});
test("saves serialize revisions, coalesce pending edits and skip unchanged snapshots", async () => {
  const sent: ProfileSnapshot[] = [];
  let release!: () => void;
  const first = new Promise<void>((r) => { release = r; });
  const writer = new ProfileWriter(remote, async (s) => {
    sent.push(s);
    if (sent.length === 1) await first;
    return { ...s, revision: s.revision + 1 };
  });
  writer.enqueue({ ...profile, name: "수정1" });
  const running = writer.flush();
  writer.enqueue({ ...profile, name: "수정2" });
  writer.enqueue({ ...profile, name: "최종" });
  release();await running;
  assert.deepEqual(sent.map((s) => [s.revision, s.profile?.name]), [[3, "수정1"], [4, "최종"]]);
  await writer.flush();assert.equal(sent.length, 2);
});
test("a failed save stays dirty for retry, and an unmounted account stops new writes", async () => {
  let calls = 0;
  const writer = new ProfileWriter(remote, async (s) => {
    calls++;if (calls === 1) throw new Error("offline");
    return { ...s, revision: s.revision + 1 };
  });
  writer.enqueue({ ...profile, name: "수정" });
  await assert.rejects(writer.flush(), /offline/);
  await writer.flush();assert.equal(calls, 2);
  writer.stop();writer.enqueue(profile);await writer.flush();assert.equal(calls, 2);
});
