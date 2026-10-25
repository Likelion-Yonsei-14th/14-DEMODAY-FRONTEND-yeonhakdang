/**
 * 사업자 정보 — the footer on every page and the policy texts read it from here.
 *
 * TODO(PG 심사 제출 전 필수): every "[…]" below is a placeholder. PG사 심사는
 * 실제 값이 HTML에 그대로 보여야 통과하므로, 확정되는 대로 이 파일만 고치면 된다.
 */
export const BUSINESS = {
  /** 상호 */
  name: "부캉이",
  /** 간이과세자라면 "간이과세자", 아니면 "" */
  taxType: "[간이과세자인 경우 '간이과세자' 표기]",
  representative: "[대표자명]",
  registrationNumber: "[000-00-00000]",
  /** 통신판매업 신고번호 */
  mailOrderNumber: "[제0000-서울서대문-0000호]",
  address: "[사업장 주소]",
  phone: "[휴대폰 또는 일반전화]",
  email: "[고객센터 이메일]",
  /** 호스팅 서비스 제공자 */
  hosting: "[호스팅사명]",
  /** 개인정보 보호책임자 */
  privacyOfficer: "[개인정보 보호책임자 성명]",
  /** 청소년 보호책임자 */
  youthOfficer: "[청소년 보호책임자 성명]",
} as const;

export const SERVICE_NAME = "연학당";

/** 약관·정책 시행일 */
export const POLICY_EFFECTIVE_DATE = "[2026년 10월 29일]";

export const POLICY_LINKS = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침", strong: true },
  { href: "/refund", label: "환불정책", strong: true },
  { href: "/youth", label: "청소년보호정책" },
] as const;

/** From inside the app: the full text in a new tab, so the flow in progress stays put. */
export function openPolicy(href: string) {
  window.open(href, "_blank", "noopener");
}
