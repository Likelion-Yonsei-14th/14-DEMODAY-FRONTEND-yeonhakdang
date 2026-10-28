/**
 * What 연학당 sells and for how much — the one source for every price shown:
 * the app's product / payment screens and the server-rendered public pages
 * (/products, /refund, the footer on /). No "use client": server pages import it.
 */

export type ProductKind = "compat" | "benefactor" | "charm";

export const PRODUCT_KINDS: ProductKind[] = ["compat", "benefactor", "charm"];

export const PRODUCTS: Record<
  ProductKind,
  {
    name: string;
    single: string;
    /** 원, 부가세 포함. */
    price: number;
    glyph: string;
    /** Prototype screen ids: 상품 상세, 결과. */
    detail: string;
    result: string;
    /** For the public product page. */
    summary: string;
    /** What one purchase includes. */
    includes: string;
    features: string[];
  }
> = {
  compat: {
    name: "합격 궁합",
    single: "합격 궁합 단건",
    price: 2900,
    glyph: "合",
    detail: "6-1",
    result: "8-1",
    summary: "지원한 대학과 나의 합격 궁합 — 대학별 합격 기운 지수와 주 단위 타임라인",
    includes: "지원 대학 최대 6곳 · 타임라인 포함",
    features: [
      "대학별 합격 기운 지수: 지원 대학 최대 6곳, 내 사주와 학교 기운을 비교",
      "월·주 단위 합격 기운 타임라인: 원서 접수부터 발표까지 기운이 오르는 시기",
      "면접·논술 길일 추천: 실력이 가장 잘 나오는 날",
    ],
  },
  benefactor: {
    name: "귀인",
    single: "귀인 단건",
    price: 1900,
    glyph: "貴",
    detail: "6-2",
    result: "8-2",
    summary: "앞으로 만나게 될 나의 귀인 — 관계별 잘 맞는 사람과 만나는 시기",
    includes: "관계 유형 1개 선택",
    features: [
      "관계 유형별 귀인: 선배 · 동기 · 교수님 · 연인 중 원하는 관계 선택",
      "만나는 시기: 귀인 운이 열리는 달과 장소 힌트",
      "알아보는 법: 귀인의 오행 특징과 첫인상 키워드",
    ],
  },
  charm: {
    name: "부적",
    single: "부적 단건",
    price: 990,
    glyph: "符",
    detail: "6-3",
    result: "8-3",
    summary: "내 오행으로 그린 나만의 합격 기운 배경화면 부적",
    includes: "고화질 저장 + 다시 뽑기 3회",
    features: [
      "내 오행으로 그린 부적: 사주에 부족한 기운을 채우는 색과 문양으로 맞춤 생성",
      "고화질 배경화면 저장: 아이폰 잠금화면 비율 그대로 저장",
      "마음에 들 때까지 다시 뽑기: 최대 3번까지 새로 그리기",
    ],
  },
};

export const PACKAGE_NAME = "3종 패키지";
export const PACKAGE_PRICE = 3790;
/** The three bought one by one. */
export const SINGLES_TOTAL = PRODUCT_KINDS.reduce((sum, k) => sum + PRODUCTS[k].price, 0);

export function won(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

/**
 * 3종 패키지 부분 환불 (환불규정): 3,790원 × (열지 않은 상품 단건가 합계 ÷ 5,790원),
 * 원 단위 미만 버림.
 */
export function packageRefund(opened: ProductKind[]): number {
  const unopened = PRODUCT_KINDS.filter((k) => !opened.includes(k));
  const rest = unopened.reduce((sum, k) => sum + PRODUCTS[k].price, 0);
  return Math.floor((PACKAGE_PRICE * rest) / SINGLES_TOTAL);
}

/** Every combination of opened products, for the refund table. */
export const PACKAGE_REFUND_CASES: ProductKind[][] = [
  [],
  ["compat"],
  ["benefactor"],
  ["charm"],
  ["compat", "benefactor"],
  ["compat", "charm"],
  ["benefactor", "charm"],
  ["compat", "benefactor", "charm"],
];

export function refundCaseLabel(opened: ProductKind[]): string {
  if (opened.length === 0) return "없음";
  if (opened.length === PRODUCT_KINDS.length) return "세 상품 모두";
  return opened.map((k) => PRODUCTS[k].name).join(" + ");
}
