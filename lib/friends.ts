/**
 * Friends and invite links — the one place that knows where friends come from.
 * Today they travel inside the invite link and are kept on this device; once
 * there is a backend, swap these for API calls and the screens stay as they are.
 */
import { birthError, type BirthInput } from "./saju/birth.ts";

export type FriendInput = BirthInput & { name: string };
export type Friend = FriendInput & { /** ms since epoch: breaks 석차 ties and drives NEW. */ addedAt: number };

/** Same as the 정보 입력 form's 이름 field. */
const NAME_MAX = 10;

/** Same name and birth → the same person. */
export function friendKey(f: FriendInput): string {
  return [f.name.trim(), f.birth, f.calendar, f.leapMonth ? 1 : 0, f.unknownTime ? "" : f.time].join("|");
}

/** Adds `f` unless already there; a returning friend keeps their first addedAt. */
export function addFriend(friends: Friend[], f: FriendInput, now: number): Friend[] {
  const key = friendKey(f);
  if (friends.some((x) => friendKey(x) === key)) return friends;
  return [...friends, { ...f, name: f.name.trim(), addedAt: now }];
}

function toBase64Url(text: string): string {
  let bin = "";
  for (const byte of new TextEncoder().encode(text)) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string {
  const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** The `?invite=` value: who invited, as the 정보 입력 form would hold it. */
export function encodeInvite(f: FriendInput): string {
  return toBase64Url(
    JSON.stringify({ n: f.name.trim(), b: f.birth, c: f.calendar, l: f.leapMonth, t: f.unknownTime ? "" : f.time }),
  );
}

/** The inviter, or null for a missing, old (`?invite=1`) or broken link. */
export function decodeInvite(code: string | null): FriendInput | null {
  if (!code) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(fromBase64Url(code));
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null) return null;
  const { n, b, c, l, t } = raw as Record<string, unknown>;
  if (typeof n !== "string" || typeof b !== "string" || typeof t !== "string") return null;
  if ((c !== 0 && c !== 1) || typeof l !== "boolean") return null;
  const name = n.trim();
  if (!name || name.length > NAME_MAX) return null;
  const friend: FriendInput = { name, birth: b, calendar: c, leapMonth: l, time: t, unknownTime: t === "" };
  return birthError(friend) ? null : friend;
}
