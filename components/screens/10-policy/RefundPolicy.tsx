"use client";

import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { BusinessFooter } from "@/components/policy/BusinessFooter";

const SUMMARY = [
  "결과를 열기 전: 결제일부터 7일 이내 전액 환불",
  "결과를 연 후: 디지털 콘텐츠 특성상 단순 변심 환불 불가 (전자상거래법 제17조 제2항 제5호)",
  "3종 패키지: 열지 않은 상품만큼 부분 환불",
  "결과 미제공·중복 결제·시스템 장애·안내와 다른 결과: 열람 여부와 관계없이 환불",
  "접수 후 3영업일 이내 결제 취소 (신용카드·카카오페이·토스페이)",
];

const PRODUCTS = [
  ["합격 궁합", "2,900원"],
  ["귀인", "1,900원"],
  ["부적", "990원"],
  ["3종 패키지 (단건 합계 5,790원)", "3,790원"],
];

const REFUNDS = [
  ["없음", "3,790원 (전액)"],
  ["합격 궁합", "1,891원"],
  ["귀인", "2,546원"],
  ["부적", "3,141원"],
  ["합격 궁합 + 귀인", "648원"],
  ["합격 궁합 + 부적", "1,243원"],
  ["귀인 + 부적", "1,898원"],
  ["세 상품 모두", "0원"],
];

/** Text follows the supplied policy artwork, including its article numbering. */
const ARTICLES = [
  ["서비스 제공기간", "결제 즉시(약 1분 내) 결과가 생성되어 제공됩니다. 보관함에서 회원 탈퇴 또는 서비스 종료 전까지 다시 볼 수 있습니다."],
  ["교환", "디지털 콘텐츠 특성상 교환은 제공하지 않습니다. 열람 전 입력 정보 오류는 제8조에 따라 환불 후 재구매할 수 있습니다."],
  ["제4조 열람 전 청약철회", "결과를 열람하기 전이라면 결제일부터 7일 이내 전액 환불. ‘보관함에서 나중에 보기’로 아직 열지 않은 경우 포함. 열람 여부는 최초 열람 시각으로 확인."],
  ["제5조 열람 후 청약철회의 제한", "결과가 표시되면 제공이 완료되는 디지털 콘텐츠로, 단순 변심(결과 불만족, 실제 합격 여부와 다름, 부적 다시 뽑기·고화질 저장 이용)은 환불되지 않음. 상품 상세의 ‘결과 예시’로 미리 확인 가능."],
  ["제7조 회사 사정으로 인한 환불", "결과 미제공, 중복 결제, 시스템 장애로 열람 불가, 안내와 다른 결과 제공 시 열람 여부와 관계없이 환불 또는 재제공."],
  ["제8조 입력 정보 오류", "열람 전 입력 실수를 발견하면 환불 후 재구매 가능. 열람 후에는 환불 불가."],
  ["제9조 미성년자의 결제", "만 14세 이상 가입. 만 19세 미만은 법정대리인 동의 필요. 동의 없는 결제는 본인 또는 법정대리인이 취소 가능(속임수·허락된 용돈 범위 등은 제한)."],
  ["제10·11조 신청 및 환불 방법", "고객센터 emilygylee@yonsei.ac.kr·[유선 전화번호]로 카카오 계정 이름, 결제일, 상품, 결제 수단, 사유를 알려 주세요. 3영업일 이내 결제한 수단(신용카드·카카오페이·토스페이)의 결제 취소로 환불하며, 실제 입금 시점은 카드사·은행 정책에 따릅니다."],
  ["제13조 분쟁의 해결", "협의가 되지 않으면 한국소비자원 또는 전자문서·전자거래분쟁조정위원회에 조정 신청 가능."],
];

function PriceRows({ rows }: { rows: string[][] }) {
  return rows.map(([label, value]) => (
    <div key={label} className="flex w-full items-start justify-between gap-[8px] text-body-m-14">
      <span className="text-text-secondary">{label}</span>
      <span className="shrink-0 font-bold">{value}</span>
    </div>
  ));
}

/** Figma: 10-1 환불 정책 (226:3213), 393 × 2219. */
export function RefundPolicy() {
  return (
    <Screen height={2243} bleed contentSized>
      <TopBar title="환불 정책" className="absolute left-0 top-[54px]" />
      <div className="w-full shrink-0 pt-[106px]">
        <div className="flex w-full flex-col items-start gap-[16px] px-[24px] pb-[32px] pt-[16px] [overflow-wrap:anywhere]">
          <h1 className="w-full font-serif text-h2-22">연학당 청약철회 및 환불규정</h1>
          <p className="w-full text-caption-12 text-text-tertiary">시행일 2026년 10월 29일 · 공개 주소 /refund</p>

          <section aria-labelledby="refund-summary" className="flex w-full flex-col gap-[8px] rounded-[16px] bg-brand-secondary-tint p-[16px]">
            <h2 id="refund-summary" className="font-bold text-body-m-14 text-brand-secondary">한눈에 보기</h2>
            {SUMMARY.map((text) => <p key={text} className="text-caption-12">· {text}</p>)}
          </section>

          <h2 className="text-h3-18">판매 상품</h2>
          <div className="flex w-full flex-col gap-[8px] rounded-[16px] border border-line-default bg-surface-default p-[16px]">
            <PriceRows rows={PRODUCTS} />
            <p className="font-medium text-caption-11 text-text-tertiary">가격은 부가세 포함 · 학과 분석·합격자 명단·공유 카드는 무료</p>
          </div>

          <h2 className="text-h3-18">3종 패키지 부분 환불</h2>
          <p className="text-caption-12 text-text-secondary">환불 금액 = 3,790원 × (열지 않은 상품 단건가 합계 ÷ 5,790원), 원 단위 미만 버림</p>
          <div className="flex w-full flex-col gap-[8px] rounded-[16px] border border-line-default bg-surface-default p-[16px]">
            <div className="flex w-full justify-between font-bold text-caption-12 text-text-tertiary"><span>이미 열어본 상품</span><span>환불 금액</span></div>
            <PriceRows rows={REFUNDS} />
          </div>

          <h2 className="text-h3-18">규정 전문</h2>
          {ARTICLES.map(([title, description]) => (
            <section key={title} className="flex w-full flex-col gap-[4px]">
              <h3 className="font-bold text-body-m-14">{title}</h3>
              <p className="text-caption-12 text-text-secondary">{description}</p>
            </section>
          ))}
        </div>
        <BusinessFooter />
      </div>
    </Screen>
  );
}
