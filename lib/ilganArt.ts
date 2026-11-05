/**
 * 일간(천간)별 연학이 그림. 원본은 design-src/originals (git 밖)에 있고,
 * public/assets/ilgan 에는 화면용으로 줄인 사본만 둔다.
 * - round: 투명 배경 원형, 512px WebP — 03 유형 카드 배지, 1:1 공유 카드
 * - card: 가로 풍경, 1200×857 JPG — 9:16 공유 카드, 카카오톡 공유 사진
 */
const SLUGS: Record<string, string> = {
  갑: "gap",
  을: "eul",
  병: "byeong",
  정: "jeong",
  무: "mu",
  기: "gi",
  경: "gyeong",
  신: "sin",
  임: "im",
  계: "gye",
};

export type IlganArt = { round: string; card: string };

/** `dayMaster`: the 일간 name, e.g. "갑목" — its first syllable is the 천간. */
export function ilganArt(dayMaster: string): IlganArt {
  const slug = SLUGS[dayMaster.charAt(0)] ?? "gap";
  return {
    round: `/assets/ilgan/round-${slug}.webp`,
    card: `/assets/ilgan/card-${slug}.jpg`,
  };
}
