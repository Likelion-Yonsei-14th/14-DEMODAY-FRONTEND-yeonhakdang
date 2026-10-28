import { cn } from "@/lib/cn";

const CATALOG = [
  { name: "합격 궁합", description: "지원 대학 최대 6곳의 합격 기운 지수·타임라인·면접 길일", price: "2,900원", href: "/products/compat" },
  { name: "귀인", description: "관계 유형별 귀인과 만나는 시기, 알아보는 법", price: "1,900원", href: "/products/gwiin" },
  { name: "부적", description: "내 오행으로 그린 고화질 배경화면 부적, 다시 뽑기 3회", price: "990원", href: "/products/bujeok" },
  { name: "3종 패키지", description: "합격 궁합 + 귀인 + 부적 (단건 합계 5,790원)", price: "3,790원", href: "/products/compat?plan=package" },
];

/** Figma 244:3426 — public product descriptions and prices. */
export function ProductCatalog({ className }: { className?: string }) {
  return (
    <section aria-label="유료 콘텐츠 · 가격 안내" className={cn("flex w-full flex-col gap-3 bg-bg-base p-6", className)}>
      <p className="text-overline-12 text-brand-secondary">PREMIUM</p>
      <h2 className="text-h3-18">연학이가 더 봐줄 수 있어요</h2>
      {CATALOG.map((product) => (
        <a key={product.name} href={product.href} className="flex w-full items-center gap-3 rounded-2xl border border-line-default bg-surface-default p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="font-bold text-body-m-14">{product.name}</h3>
            <p className="text-caption-12 text-text-secondary">{product.description}</p>
          </div>
          <span className="shrink-0 font-bold text-body-m-14">{product.price}</span>
        </a>
      ))}
      <a href="/refund" className="font-medium text-caption-11 text-text-tertiary">부가세 포함 · 결제 즉시 제공 · 결과를 열기 전 7일 이내 취소·환불 가능 · 환불 정책 보기 ›</a>
    </section>
  );
}
