"use client";

import { useMemo } from "react";

import { friendKey, type Friend } from "@/lib/friends";
import { useProto } from "@/lib/proto";
import { analyzeBirth, compatibility, rankFriends, type Analysis, type Compat, type Rank } from "@/lib/saju";
import { useAnalysis } from "@/lib/useAnalysis";

export type RosterEntry = {
  key: string;
  friend: Friend;
  name: string;
  initial: string;
  analysis: Analysis;
  compat: Compat;
  score: number;
  rank: Rank;
  /** "경영학과 · 개척하는 리더형" — the friend's 1위 학과 and 유형. */
  sub: string;
  isNew: boolean;
  addedAt: number;
};

export type Roster = {
  entries: RosterEntry[];
  /** Rounded mean 궁합; 0 with nobody on the 명단. */
  average: number;
};

/**
 * The 합격자 명단, ranked by 궁합 with me. `seenAt` decides NEW (defaults to
 * the last time the 명단 was opened).
 */
export function useRoster(seenAt?: number): Roster {
  const { state } = useProto();
  const me = useAnalysis();
  const since = seenAt ?? state.rosterSeenAt;
  return useMemo(() => {
    const scored = state.friends.flatMap((friend) => {
      const result = analyzeBirth(friend);
      if (!result.ok) return [];
      const analysis = result.analysis;
      const compat = compatibility(me, analysis, friend.name);
      const top = analysis.top[0];
      return [
        {
          key: friendKey(friend),
          friend,
          name: friend.name,
          initial: friend.name.slice(0, 1),
          analysis,
          compat,
          score: compat.score,
          sub: `${top.major.대표학과[0]} · ${analysis.dayMaster.type}`,
          isNew: friend.addedAt > since,
          addedAt: friend.addedAt,
        },
      ];
    });
    const entries = rankFriends(scored);
    const average = entries.length
      ? Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length)
      : 0;
    return { entries, average };
  }, [state.friends, me, since]);
}
