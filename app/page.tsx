import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { ProtoLoader } from "@/components/proto/ProtoLoader";
import { PublicShell } from "@/components/public/PublicShell";
import {
  PACKAGE_NAME,
  PACKAGE_PRICE,
  PRODUCT_KINDS,
  PRODUCTS,
  SINGLES_TOTAL,
  won,
} from "@/lib/catalog";

export const metadata: Metadata = {
  title: "연학당",
  description: "타고난 사주로 나의 학과를 찾다",
};

/** A mobile web app: fit the device, no pinch zoom, paint under the notch. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#faf8f3",
};

/**
 * The app itself draws in the browser, so the public facts — what it is, what
 * it costs, who runs it — are rendered here on the server, into the HTML.
 */
export default function ProtoPage() {
  return (
    <>
      {/* Without JavaScript the app's loading cover would hide this content. */}
      <noscript>
        <style>{".proto-cover{display:none}"}</style>
      </noscript>
      <ProtoLoader>
        <PublicShell>
          <div className="flex w-full flex-col items-start gap-[16px] px-[24px] pb-[32px] pt-[24px] [overflow-wrap:anywhere]">
            <p className="text-caption-12 font-bold text-brand-primary">2027 대입 · 수험생 전용</p>
            <h1 className="font-serif text-h1-26">타고난 사주로 나의 학과를 찾다</h1>
            <p className="text-body-m-14 text-text-secondary">
              생년월일시만 입력하면 오행으로 풀어낸 적합 학과 TOP 3를 알려줘요. 학과 분석·친구 합격자 명단·공유 카드는 무료예요.
            </p>

            <h2 className="pt-[8px] text-h3-18">유료 상품 및 가격</h2>
            <ul className="flex w-full flex-col gap-[8px]">
              {PRODUCT_KINDS.map((kind) => (
                <li key={kind} className="flex w-full items-start justify-between gap-[8px] text-body-m-14">
                  <Link href={`/products#${kind}`} className="text-text-secondary">
                    {PRODUCTS[kind].name} <span className="text-caption-12 text-text-tertiary">— {PRODUCTS[kind].includes}</span>
                  </Link>
                  <span className="shrink-0 font-bold">{won(PRODUCTS[kind].price)}</span>
                </li>
              ))}
              <li className="flex w-full items-start justify-between gap-[8px] text-body-m-14">
                <Link href="/products#package" className="text-text-secondary">
                  {PACKAGE_NAME} <span className="text-caption-12 text-text-tertiary">— 단건 합계 {won(SINGLES_TOTAL)}</span>
                </Link>
                <span className="shrink-0 font-bold">{won(PACKAGE_PRICE)}</span>
              </li>
            </ul>
            <p className="text-caption-11 text-text-tertiary">가격은 부가세 포함 · 결제 즉시(약 1분 내) 결과 제공</p>
            <Link href="/products" className="text-caption-12 font-bold text-brand-secondary">
              상품 자세히 보기 ›
            </Link>
          </div>
        </PublicShell>
      </ProtoLoader>
    </>
  );
}
