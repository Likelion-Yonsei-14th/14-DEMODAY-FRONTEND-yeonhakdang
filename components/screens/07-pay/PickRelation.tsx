"use client";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { BottomCta } from "@/components/ui/BottomCta";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { purchaseSteps, stepLabel, useProto, type Relation } from "@/lib/proto";

/**
 * Figma: 관계 유형 tiles (30:1538…) — 166px cards, the selected one is tinted.
 * Only 선배 ships a white-on-navy glyph; the others are whitened with a filter
 * when they become the selected card.
 */
const RELATIONS: Array<{ id: Relation; icon: string; selectedIcon?: string; caption: string }> = [
  {
    id: "선배",
    icon: "icon-crown-20",
    selectedIcon: "icon-crown-20-inverse",
    caption: "학교생활을 이끌어 줄 사람",
  },
  { id: "동기", icon: "icon-user-20", caption: "4년을 함께 버틸 단짝" },
  { id: "교수님", icon: "icon-sparkle-20-muted", caption: "진로의 문을 열어 줄 스승" },
  { id: "연인", icon: "icon-gift-20", caption: "캠퍼스에서 만날 인연" },
];

function RelationCard({
  id,
  icon,
  selectedIcon,
  caption,
  selected = false,
  onPress,
}: {
  id: string;
  icon: string;
  selectedIcon?: string;
  caption: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-[166px] shrink-0 flex-col items-start gap-[10px] overflow-clip rounded-[16px] px-[16px] py-[18px] transition-colors",
        selected
          ? "border-2 border-brand-secondary bg-brand-secondary-tint"
          : "border border-line-default bg-surface-default",
      )}
    >
      <div className="relative flex w-[134px] shrink-0 items-center justify-between overflow-clip">
        <div
          className={cn(
            "relative flex size-[40px] shrink-0 items-center justify-center overflow-clip rounded-[12px]",
            selected ? "bg-brand-secondary" : "bg-bg-subtle",
          )}
        >
          <Icon
            name={selected ? (selectedIcon ?? icon) : icon}
            size={20}
            className={cn(selected && !selectedIcon && "brightness-0 invert")}
          />
        </div>
        {selected && (
          <BadgeIcon icon="icon-check-on-navy" size={22} tone="solid" />
        )}
      </div>
      <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
        {id}
      </p>
      <p className="relative w-[134px] shrink-0 text-caption-12 text-text-secondary">
        {caption}
      </p>
    </Tap>
  );
}

/** Figma: 7-2 귀인 · 관계 유형 선택 (PAY-05) (30:1513) */
export function PickRelation() {
  const proto = useProto();
  const { state, update } = proto;
  const steps = purchaseSteps({ product: state.product, plan: state.plan });
  // Reached from 8-2 "다른 관계 귀인도 보기" outside a checkout: 7-2 → 7-3.
  const next = steps[steps.indexOf("7-2") + 1] ?? "7-3";

  return (
    <Screen>
      <TopBar title="관계 유형 선택" className="absolute left-0 top-[54px]" />

      {/* heading (30:1533) */}
      <div className="absolute left-[24px] top-[118px] flex flex-col items-start gap-[6px] overflow-clip whitespace-nowrap">
        <p className="relative shrink-0 text-overline-12 text-brand-secondary">
          {steps.includes("7-2") ? stepLabel(state, "7-2") : "귀인 · 1 / 2"}
        </p>
        <p className="relative shrink-0 font-serif text-h2-22">어떤 귀인이 궁금해요?</p>
        <p className="relative shrink-0 text-body-m-14 text-text-secondary">
          하나를 고르면 그 관계의 귀인을 자세히 알려줘요
        </p>
      </div>

      {/* 관계 유형 (30:1537) */}
      <div className="absolute left-[24px] top-[232px] flex w-[345px] flex-wrap content-start items-start gap-[12px] overflow-clip">
        {RELATIONS.map((relation) => (
          <RelationCard
            key={relation.id}
            {...relation}
            selected={relation.id === state.relation}
            onPress={() => update({ relation: relation.id })}
          />
        ))}
      </div>

      <Mascot
        pose="happy"
        className="absolute left-[24px] top-[585.41px] rounded-[24px] bg-bg-base"
        width={150}
        height={101.434}
      />
      <SpeechBubble tail="left" className="absolute left-[180px] top-[586px]">
        {`${state.relation} 귀인이라…\n벌써 보이는 사람이 있어!`}
      </SpeechBubble>

      <Bottom from={740}>
        <BottomCta className="absolute left-0 top-[740px]">
          <Button
            label={`${state.relation} 귀인으로 다음 단계`}
            onPress={() => proto.go(next)}
          />
        </BottomCta>
      </Bottom>
    </Screen>
  );
}
