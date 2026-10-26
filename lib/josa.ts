/**
 * 조사 after a name or word. Pure, so lib/saju and the screens share it.
 * A word that doesn't end in 한글 counts as having no 받침.
 */

/** True when the last syllable ends in a final consonant (받침). */
export function hasBatchim(word: string): boolean {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

/** "with/without 받침" pairs, e.g. josa("민지", "이/가") → "민지가". */
export type JosaPair = "이/가" | "을/를" | "은/는" | "과/와" | "이랑/랑" | "이야/야";

export function josa(word: string, pair: JosaPair): string {
  const [withBatchim, without] = pair.split("/");
  return word + (hasBatchim(word) ? withBatchim : without);
}
