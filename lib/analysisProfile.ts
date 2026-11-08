import { addFriend } from "./friends.ts";
import type { ProtoState } from "./proto";

/** Only analysis inputs and roster data. Auth, orders and entitlements stay server-owned. */
export type AnalysisProfile = Pick<ProtoState, "name" | "birth" | "gender" | "calendar" | "leapMonth" | "time" | "unknownTime" | "analyzed" | "friends" | "rosterSeenAt">;
export type ProfileSnapshot = { accountId: string; revision: number; profile: AnalysisProfile | null };

export function analysisProfile(s: AnalysisProfile): AnalysisProfile {
  return { name: s.name, birth: s.birth, gender: s.gender, calendar: s.calendar,
    leapMonth: s.leapMonth, time: s.time, unknownTime: s.unknownTime, analyzed: s.analyzed,
    friends: s.friends.map(({ name, birth, calendar, leapMonth, time, unknownTime, addedAt }) =>
      ({ name, birth, calendar, leapMonth, time, unknownTime, addedAt })), rosterSeenAt: s.rosterSeenAt };
}

/** A guest's completed analysis follows them through login; otherwise the account wins. */
export function profileToRestore(local: ProtoState, remote: ProfileSnapshot): AnalysisProfile | null {
  const owner = local.analysisOwner ?? local.account;
  const guestLogin = local.loginPending && !owner && local.analyzed;
  if (guestLogin) {
    const adopted = analysisProfile(local);
    if (remote.profile) {
      adopted.friends = local.friends.reduce((friends, friend) => addFriend(friends, friend, friend.addedAt), remote.profile.friends);
      adopted.rosterSeenAt = Math.max(local.rosterSeenAt, remote.profile.rosterSeenAt);
    }
    return adopted;
  }
  if (!remote.profile && local.analyzed && (!owner || owner === remote.accountId)) return analysisProfile(local);
  return remote.profile;
}

/** Serial saves and optimistic revisions stop an older tab from silently overwriting new data. */
export class ProfileWriter {
  private latest: AnalysisProfile | null = null;
  private saved: string;
  private running: Promise<void> | null = null;
  private stopped = false;
  private snapshot: ProfileSnapshot;
  private save: (s: ProfileSnapshot) => Promise<ProfileSnapshot>;
  constructor(snapshot: ProfileSnapshot, save: (s: ProfileSnapshot) => Promise<ProfileSnapshot>) {
    this.snapshot = snapshot;
    this.save = save;
    this.saved = JSON.stringify(snapshot.profile);
  }
  stop() { this.stopped = true; }
  enqueue(profile: AnalysisProfile) { this.latest = analysisProfile(profile); }
  flush(): Promise<void> {
    if (this.stopped) return Promise.resolve();
    if (this.running) return this.running;
    this.running = this.write().finally(() => { this.running = null; });
    return this.running;
  }
  private async write() {
    while (!this.stopped && this.latest && JSON.stringify(this.latest) !== this.saved) {
      const profile = this.latest;
      this.snapshot = await this.save({ ...this.snapshot, profile });
      this.saved = JSON.stringify(profile);
    }
  }
}

let flushCurrent: (() => Promise<void>) | null = null;
export function registerProfileFlush(flush: (() => Promise<void>) | null) { flushCurrent = flush; }
export async function flushAnalysisProfile() { await flushCurrent?.(); }
