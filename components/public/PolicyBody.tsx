import { PolicyArticles } from "@/components/public/PolicyArticles";
import { PackageRefundTable, ProductPriceList } from "@/components/public/PriceRows";
import { PACKAGE_PRICE, SINGLES_TOTAL, won } from "@/lib/catalog";
import { REFUND, REFUND_SUMMARY, type PolicyDoc } from "@/lib/policies";

/** Title, 시행일 and the draft notice of a policy page. */
function PolicyHeading({ doc }: { doc: PolicyDoc }) {
  return (
    <>
      <h1 className="w-full font-serif text-h2-22">{doc.title}</h1>
      <p className="w-full text-caption-12 text-text-tertiary">시행일 {doc.effectiveDate}</p>
      {doc.draft && (
        <p className="w-full rounded-[12px] bg-brand-accent-tint px-[12px] py-[8px] text-caption-12 text-brand-accent">
          검토 중인 초안입니다. 확정되면 시행일과 함께 다시 공지합니다.
        </p>
      )}
      {doc.intro && <p className="w-full text-caption-12 text-text-secondary">{doc.intro}</p>}
    </>
  );
}

/** 이용약관 · 개인정보처리방침 · 청소년보호정책: heading plus articles. */
export function PolicyBody({ doc }: { doc: PolicyDoc }) {
  return (
    <div className="flex w-full flex-col items-start gap-[16px] px-[24px] pb-[32px] pt-[16px] [overflow-wrap:anywhere]">
      <PolicyHeading doc={doc} />
      <PolicyArticles articles={doc.articles} />
    </div>
  );
}

/** 청약철회 및 환불규정: also on the in-app 10-1 screen. */
export function RefundBody() {
  return (
    <div className="flex w-full flex-col items-start gap-[16px] px-[24px] pb-[32px] pt-[16px] [overflow-wrap:anywhere]">
      <PolicyHeading doc={REFUND} />

      <section aria-labelledby="refund-summary" className="flex w-full flex-col gap-[8px] rounded-[16px] bg-brand-secondary-tint p-[16px]">
        <h2 id="refund-summary" className="font-bold text-body-m-14 text-brand-secondary">한눈에 보기</h2>
        {REFUND_SUMMARY.map((text) => <p key={text} className="text-caption-12">· {text}</p>)}
      </section>

      <h2 className="text-h3-18">판매 상품</h2>
      <ProductPriceList />

      <h2 className="text-h3-18">3종 패키지 부분 환불</h2>
      <p className="text-caption-12 text-text-secondary">
        환불 금액 = {PACKAGE_PRICE.toLocaleString("ko-KR")}원 × (열지 않은 상품 단건가 합계 ÷ {won(SINGLES_TOTAL)}), 원 단위 미만 버림
      </p>
      <PackageRefundTable />

      <h2 className="text-h3-18">규정 전문</h2>
      <PolicyArticles articles={REFUND.articles} />
    </div>
  );
}
