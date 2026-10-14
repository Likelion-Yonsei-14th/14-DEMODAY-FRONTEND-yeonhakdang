import { cn } from "@/lib/cn";

/** Figma: RankLabel — 수석 동기 (14:93) | 차석 (14:95) | 합격 (14:97) | 추가 합격 (14:99). */
export type RankKind = "수석 동기" | "차석" | "합격" | "추가 합격";

const STYLES: Record<RankKind, { pill: string; text: string }> = {
  "수석 동기": { pill: "bg-brand-accent", text: "text-text-primary" },
  차석: { pill: "bg-brand-secondary", text: "text-text-inverse" },
  합격: { pill: "bg-brand-secondary-tint", text: "text-brand-secondary" },
  "추가 합격": {
    pill: "border border-line-strong",
    text: "text-text-secondary",
  },
};

export function RankLabel({
  rank,
  className,
}: {
  rank: RankKind;
  className?: string;
}) {
  const { pill, text } = STYLES[rank];
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center rounded-full px-[10px] py-[4px]",
        pill,
        className,
      )}
    >
      <p
        className={cn(
          "relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px]",
          text,
        )}
      >
        {rank}
      </p>
    </div>
  );
}
