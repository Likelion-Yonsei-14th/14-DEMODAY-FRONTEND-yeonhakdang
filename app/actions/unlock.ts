"use server";

import { MAX_CODE_LENGTH, matchesCode, parseCodes } from "@/lib/unlock";

/** A wrong code waits this long, so guessing codes one after another is slow. */
const WRONG_CODE_DELAY_MS = 1000;

/**
 * Is `code` one of the 이용권 codes in UNLOCK_CODES? The codes never reach the
 * browser; it only learns yes or no. Also re-checked on every app start, so
 * removing a code from UNLOCK_CODES locks the devices that used it.
 */
export async function verifyUnlockCode(code: unknown): Promise<boolean> {
  const ok =
    typeof code === "string" && code.length <= MAX_CODE_LENGTH * 2 && matchesCode(code, parseCodes(process.env.UNLOCK_CODES));
  if (!ok) await new Promise((resolve) => setTimeout(resolve, WRONG_CODE_DELAY_MS));
  return ok;
}
