import {
  PACKAGE_NAME,
  PACKAGE_PRICE,
  PACKAGE_REFUND_CASES,
  PRODUCT_KINDS,
  PRODUCTS,
  SINGLES_TOTAL,
  packageRefund,
  refundCaseLabel,
  won,
} from "@/lib/catalog";

/** Hook-free, so the same rows render on the server pages and in the app. */
export function PriceRows({ rows }: { rows: [label: string, value: string][] }) {
  return (
    <dl className="flex w-full flex-col gap-[8px]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex w-full items-start justify-between gap-[8px] text-body-m-14">
          <dt className="text-text-secondary">{label}</dt>
          <dd className="shrink-0 font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 판매 상품: every product and the package, 부가세 포함. */
export function ProductPriceList() {
  return (
    <div className="flex w-full flex-col gap-[8px] rounded-[16px] border border-line-default bg-surface-default p-[16px]">
      <PriceRows
        rows={[
          ...PRODUCT_KINDS.map((k): [string, string] => [PRODUCTS[k].name, won(PRODUCTS[k].price)]),
          [`${PACKAGE_NAME} (단건 합계 ${won(SINGLES_TOTAL)})`, won(PACKAGE_PRICE)],
        ]}
      />
      <p className="font-medium text-caption-11 text-text-tertiary">
        가격은 부가세 포함 · 학과 분석·합격자 명단·공유 카드는 무료
      </p>
    </div>
  );
}

/** 3종 패키지 부분 환불표, computed from the 환불규정 formula. */
export function PackageRefundTable() {
  return (
    <div className="flex w-full flex-col gap-[8px] rounded-[16px] border border-line-default bg-surface-default p-[16px]">
      <div className="flex w-full justify-between font-bold text-caption-12 text-text-tertiary">
        <span>이미 열어본 상품</span>
        <span>환불 금액</span>
      </div>
      <PriceRows
        rows={PACKAGE_REFUND_CASES.map((opened): [string, string] => [
          refundCaseLabel(opened),
          won(packageRefund(opened)) + (opened.length === 0 ? " (전액)" : ""),
        ])}
      />
    </div>
  );
}
