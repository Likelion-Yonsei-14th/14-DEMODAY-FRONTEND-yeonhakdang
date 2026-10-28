"use client";

import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { BusinessFooter } from "@/components/policy/BusinessFooter";
import { POLICY_ARTICLES } from "@/lib/policy-content";

function PolicyPage({ title, height, children }: { title: string; height: number; children: React.ReactNode }) {
  return (
    <Screen height={height} bleed contentSized>
      <TopBar title={title} className="absolute left-0 top-[54px]" />
      <div className="w-full shrink-0 pt-[106px]">
        <article className="flex w-full flex-col gap-4 px-6 pb-8 pt-4 [overflow-wrap:anywhere]">{children}</article>
        <BusinessFooter />
      </div>
    </Screen>
  );
}

function LegalDocument({ kind }: { kind: "terms" | "privacy" }) {
  const title = kind === "terms" ? "이용약관" : "개인정보처리방침";
  return (
    <PolicyPage title={title} height={kind === "terms" ? 2721 : 2299}>
      <h1 className="font-serif text-h2-22">{kind === "terms" ? "연학당 서비스 이용약관" : title}</h1>
      <p className="text-caption-12 text-text-tertiary">시행일 2026년 10월 29일 · 공개 주소 /{kind}</p>
      {POLICY_ARTICLES[kind].map((article, index) => (
        <section key={article.title ?? index} className="flex w-full flex-col gap-1">
          {article.title && <h2 className="font-bold text-body-m-14">{article.title}</h2>}
          <div className="text-caption-12 text-text-secondary">
            {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
      ))}
    </PolicyPage>
  );
}

export function TermsPage() { return <LegalDocument kind="terms" />; }
export function PrivacyPage() { return <LegalDocument kind="privacy" />; }

const box = "flex w-full flex-col gap-2 rounded-2xl border border-line-default bg-surface-default p-4 text-body-m-14";

export function AboutPage() {
  return (
    <PolicyPage title="서비스 소개" height={1323}>
      <p className="text-overline-12 text-brand-secondary">SERVICE</p>
      <h1 className="font-serif text-h2-22">연학당은 이런 서비스예요</h1>
      <p className="text-body-m-14 text-text-secondary">생년월일과 출생시간으로 사주(오행·십성)를 분석해 수험생에게 어울리는 학과를 추천하는 모바일 웹 콘텐츠 서비스예요. 결과는 진로 탐색을 위한 참고용 콘텐츠예요.</p>
      <h2 className="text-h3-18">무료로 이용할 수 있어요</h2>
      <div className={box}>
        <p>· 내 학과 찾기 — 오행으로 풀어낸 적합 학과 TOP 3</p>
        <p>· 동기 합격자 명단 — 친구 결과를 모아 궁합 순위로 보여줘요</p>
        <p>· 결과 공유 카드 — 인스타그램·카카오톡 공유</p>
      </div>
      <h2 className="text-h3-18">유료 콘텐츠</h2>
      <div className={box}>
        {[
          ["합격 궁합 · 지원 대학 최대 6곳", "2,900원", "/products/compat"],
          ["귀인 · 관계 유형 1개", "1,900원", "/products/gwiin"],
          ["부적 · 고화질 저장 + 다시 뽑기 3회", "990원", "/products/bujeok"],
          ["3종 패키지", "3,790원", "/products/compat?plan=package"],
        ].map(([name, price, href]) => <a key={name} href={href} className="flex justify-between gap-2"><span className="text-text-secondary">{name}</span><strong className="shrink-0">{price}</strong></a>)}
        <p className="font-medium text-caption-11 text-text-tertiary">부가세 포함 · 건별 결제(정기결제·포인트 충전 없음) · 결제 즉시 제공</p>
      </div>
      <h2 className="text-h3-18">이용 방법</h2>
      <div className={box}>
        <p>1　생년월일·출생시간 입력</p>
        <p>2　카카오로 로그인 (만 14세 이상)</p>
        <p>3　무료 학과 결과 확인</p>
        <p>4　원하는 유료 콘텐츠 결제 → 바로 결과 확인, 보관함에 저장</p>
      </div>
      <p className="text-caption-12 text-text-tertiary">결제 수단: 신용·체크카드, 카카오페이, 토스페이 · 환불은 <a href="/refund" className="underline">환불 정책</a>을 따라요.</p>
    </PolicyPage>
  );
}
