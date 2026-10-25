"use client";

import { MajorMascot } from "@/components/mascot/MajorMascot";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { BannerProduct, PRODUCT_BANNERS } from "@/components/result/BannerProduct";
import { CardCompatType } from "@/components/result/CardCompatType";
import { CardMajorRank } from "@/components/result/CardMajorRank";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/cn";
import { displayName, rosterScreen, useProto } from "@/lib/proto";
import { ELEMENT_HANJA } from "@/lib/saju";
import { useAnalysis } from "@/lib/useAnalysis";

/**
 * Figma: Pattern/Result/Hero (73:2761) — 345×236 headline block.
 * 9-5 detaches this frame and sizes the mascot differently, so the mascot box
 * is a prop rather than fixed.
 */
export function ResultHero({
  mascot = { left: 195, top: 86.97, width: 150, height: 145.697 },
  className,
}: {
  mascot?: { left: number; top: number; width: number; height: number };
  className?: string;
}) {
  const { state } = useProto();
  const { dayMaster, strongest } = useAnalysis();
  return (
    <div className={cn("relative h-[236px] w-[345px] shrink-0", className)}>
      <p className="absolute left-0 top-[30px] whitespace-nowrap text-overline-12 text-brand-secondary">
        {displayName(state)}님의 사주 학과
      </p>
      <div className="absolute left-0 top-[54px] whitespace-pre-line font-serif text-h1-26">
        {"큰 나무처럼\n길을 여는\n리더형이에요"}
      </div>
      <p className="absolute left-0 top-[166px] whitespace-nowrap text-body-m-14 text-text-secondary">
        {ELEMENT_HANJA[strongest]} 기운이 강한 {dayMaster.name}({dayMaster.hanja}) 일간
      </p>
      <MajorMascot
        className="absolute"
        width={mascot.width}
        height={mascot.height}
        style={{ left: mascot.left, top: mascot.top }}
      />
      <SpeechBubble
        tail="bottom-left"
        style="secondary"
        className="absolute left-[206px] top-0"
      >
        {"TOP 3 학과를\n골라왔어!"}
      </SpeechBubble>
    </div>
  );
}

/** Figma: Pattern/Result/Top 3 Majors (74:3698). Scores come from the 학과 표. */
export function Top3Majors({ className }: { className?: string }) {
  const { top } = useAnalysis();
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip",
        className,
      )}
    >
      <SectionTitle
        title="나에게 맞는 학과 TOP 3"
        caption="적합도 점수는 오행 분포를 학과 매핑표와 비교해 산출해요"
      />
      {top.map((pick, i) => (
        <CardMajorRank
          key={pick.major.id}
          rank={(i + 1) as 1 | 2 | 3}
          major={pick.major.대표학과[0]}
          college={`${pick.major.대계열.replace(/계열$/, "")} · ${pick.major.중계열}`}
          score={String(pick.display)}
          barRatio={pick.display / 100}
          reason={pick.major.근거}
        />
      ))}
    </div>
  );
}

/** Figma: Pattern/Result/Major Type Match (74:3624). */
export function MajorTypeMatch({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip",
        className,
      )}
    >
      <SectionTitle title="학과 유형 궁합" caption="나와 잘 맞는 유형 · 부딪히는 유형" />
      <CardCompatType
        kind="good"
        title="정화(丁火) · 표현하는 크리에이터형"
        description="나무가 불을 살리듯, 내 추진력에 아이디어를 더해줘요."
      />
      <CardCompatType
        kind="clash"
        title="경금(庚金) · 원칙을 지키는 분석가형"
        description="도끼가 나무를 베듯 방향이 자주 부딪혀요. 역할을 나누면 오히려 좋은 팀이 돼요."
      />
    </div>
  );
}

/** Figma: Pattern/Result/Actions (74:2714). */
export function ResultActions({ className }: { className?: string }) {
  const proto = useProto();
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[10px] overflow-clip",
        className,
      )}
    >
      <Button
        label="동기 합격자 명단 보기"
        onPress={() => proto.go(rosterScreen(proto))}
      />
      <Button
        label="내 학과 카드 공유하기"
        type="outline"
        onPress={() => proto.go("5-1")}
      />
    </div>
  );
}

/** Figma: Pattern/Mascot Tip (74:2594) — size S, 40px badge. */
export function MascotTipSmall({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex shrink-0 items-center gap-[6px] overflow-clip", className)}
    >
      <MascotFaceBadge
        size={40}
        className="border-2"
        imageInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <SpeechBubble tail="left" className="shrink-0">
        {children}
      </SpeechBubble>
    </div>
  );
}

/** Figma: Pattern/Result/More From Yeonhak (74:3860). */
export function MoreFromYeonhak({ className }: { className?: string }) {
  const proto = useProto();
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip",
        className,
      )}
    >
      <SectionTitle
        title="연학이가 더 봐줄 수 있어요"
        caption="수시 원서 접수 전, 합격 기운을 미리 확인해 보세요"
      />
      <MascotTipSmall>{"지원 전략이 고민이면\n연학이가 더 봐줄게!"}</MascotTipSmall>
      {PRODUCT_BANNERS.map((banner) => (
        <BannerProduct
          key={banner.product}
          {...banner}
          onPress={() => proto.openProduct(banner.product)}
        />
      ))}
    </div>
  );
}
