/**
 * 이용권 codes: a code from UNLOCK_CODES (server-only, comma-separated) opens
 * every paid result on the device that entered it. Pure, so the server action
 * (app/actions/unlock.ts) and the tests share it.
 */

/** Spaces and dashes don't count, and neither does case: "ab-cd 12" = "ABCD12". */
export function normalizeCode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase();
}

/** The codes in UNLOCK_CODES; blanks are dropped. */
export function parseCodes(env: string | undefined): string[] {
  return (env ?? "").split(",").map(normalizeCode).filter(Boolean);
}

/** Compares every character, so a wrong code takes as long as a right one. */
function sameText(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/** A code longer than this is never one of ours. */
export const MAX_CODE_LENGTH = 64;

export function matchesCode(code: string, codes: string[]): boolean {
  const entered = normalizeCode(code);
  if (!entered || entered.length > MAX_CODE_LENGTH) return false;
  return codes.reduce((found, c) => sameText(entered, c) || found, false);
}
