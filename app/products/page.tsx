import type { Metadata } from "next";
import Link from "next/link";

import { PublicShell } from "@/components/public/PublicShell";
import {
  PACKAGE_NAME,
  PACKAGE_PRICE,
  PRODUCT_KINDS,
  PRODUCTS,
  SINGLES_TOTAL,
  won,
} from "@/lib/catalog";
import { REFUND_SUMMARY } from "@/lib/policies";

export const metadata: Metadata = {
  title: "연학당 상품 및 가격",
  description: `합격 궁합 ${won(PRODUCTS.compat.price)}, 귀인 ${won(PRODUCTS.benefactor.price)}, 부적 ${won(PRODUCTS.charm.price)}, 3종 패키지 ${won(PACKAGE_PRICE)} — 연학당 유료 상품의 내용과 가격(부가세 포함).`,
};

const DELIVERY = "결제 즉시(약 1분 내) 결과가 생성되어 보관함에 제공되며, 회원 탈퇴 또는 서비스 종료 전까지 다시 볼 수 있습니다.";

function ProductCard({
  id,
  glyph,
  name,
  price,
  summary,
  includes,
  features,
  note,
  checkout,
}: {
  id: string;
  glyph: string;
  name: string;
  price: number;
  summary: string;
  includes: string;
  features: string[];
  note?: string;
  /** The app's entry into this product's purchase (login → 정보 입력 → 결제). */
  checkout: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-name`}
      className="flex w-full scroll-mt-[16px] flex-col gap-[12px] rounded-[16px] border border-line-default bg-surface-default p-[20px]"
    >
      <div className="flex w-full items-start justify-between gap-[12px]">
        <div className="flex items-center gap-[10px]">
          <span aria-hidden className="flex size-[36px] items-center justify-center rounded-full bg-brand-primary-tint font-serif text-h3-18 text-brand-primary">
            {glyph}
          </span>
          <h2 id={`${id}-name`} className="text-h3-18">{name}</h2>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-h3-18 text-brand-primary">{won(price)}</span>
          {note && <span className="block text-caption-11 text-text-tertiary">{note}</span>}
        </p>
      </div>
      <p className="text-body-m-14 text-text-secondary">{summary}</p>
      <ul className="flex flex-col gap-[4px] text-caption-12 text-text-secondary">
        {features.map((f) => <li key={f}>· {f}</li>)}
      </ul>
      <dl className="flex flex-col gap-[2px] rounded-[12px] bg-bg-subtle px-[12px] py-[10px] text-caption-12">
        <div className="flex gap-[8px]"><dt className="shrink-0 font-bold text-text-secondary">구성</dt><dd className="text-text-secondary">{includes}</dd></div>
        <div className="flex gap-[8px]"><dt className="shrink-0 font-bold text-text-secondary">제공</dt><dd className="text-text-secondary">{DELIVERY}</dd></div>
      </dl>
      <Link
        href={checkout}
        className="flex h-[44px] w-full items-center justify-center rounded-[12px] border border-brand-primary text-label-button-15 text-brand-primary"
      >
        {won(price)} 구매하기
      </Link>
    </section>
  );
}

/** Server-rendered 상품 및 가격: what PG 심사 checks, readable without a login. */
export default function ProductsPage() {
  return (
    <PublicShell>
      <div className="flex w-full flex-col items-start gap-[16px] px-[24px] pb-[32px] pt-[16px] [overflow-wrap:anywhere]">
        <h1 className="w-full font-serif text-h2-22">상품 및 가격</h1>
        <p className="text-body-m-14 text-text-secondary">
          생년월일시로 보는 적합 학과 분석, 친구 합격자 명단, 공유 카드는 무료예요. 아래 상품은 결제 후 이용할 수 있으며, 모든 가격은 부가세 포함 금액입니다.
        </p>

        {PRODUCT_KINDS.map((kind) => {
          const p = PRODUCTS[kind];
          return (
            <ProductCard
              key={kind}
              id={kind}
              glyph={p.glyph}
              name={p.name}
              price={p.price}
              summary={p.summary}
              includes={p.includes}
              features={p.features}
              checkout={`/?checkout=1&product=${kind}`}
            />
          );
        })}

        <ProductCard
          id="package"
          glyph="三"
          name={PACKAGE_NAME}
          price={PACKAGE_PRICE}
          note={`단건 합계 ${won(SINGLES_TOTAL)}`}
          summary={`합격 궁합 + 귀인 + 부적을 한 번에 — 단건으로 살 때보다 ${won(SINGLES_TOTAL - PACKAGE_PRICE)} 저렴해요.`}
          includes={PRODUCT_KINDS.map((k) => `${PRODUCTS[k].name}(${PRODUCTS[k].includes})`).join(", ")}
          features={["열지 않은 상품만큼 부분 환불 가능 (환불정책 참고)"]}
          checkout="/?checkout=1&product=compat&plan=package"
        />

        <section aria-labelledby="refund-summary" className="flex w-full flex-col gap-[8px] rounded-[16px] bg-brand-secondary-tint p-[16px]">
          <h2 id="refund-summary" className="font-bold text-body-m-14 text-brand-secondary">취소·환불 안내</h2>
          {REFUND_SUMMARY.map((text) => <p key={text} className="text-caption-12">· {text}</p>)}
          <Link href="/refund" className="text-caption-12 font-bold text-brand-secondary">
            환불정책 전체 보기 ›
          </Link>
        </section>

        <p className="text-caption-11 text-text-tertiary">
          결제 수단: 신용카드 · 카카오페이 · 토스페이. 사주 결과는 진로 탐색을 위한 참고용 콘텐츠이며 합격을 보장하지 않습니다.
        </p>

        <Link
          href="/"
          className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-brand-primary text-label-button-15 text-text-inverse"
        >
          무료로 내 학과 찾기
        </Link>
      </div>
    </PublicShell>
  );
}
