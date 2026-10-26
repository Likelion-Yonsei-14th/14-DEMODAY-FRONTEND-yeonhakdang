import { RankLabel, type RankKind } from "@/components/roster/RankLabel";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";

/**
 * Figma: Card/Friend Row — 수석 동기 (17:147) | 차석 (17:161) | 합격 (17:175) |
 * 추가 합격 (17:189). The 수석 row gets the gold border and avatar tint.
 */
export function CardFriendRow({
  initial,
  name,
  rank,
  sub,
  score,
  showNew = false,
  onPress,
  className,
}: {
  initial: string;
  name: string;
  rank: RankKind;
  sub: string;
  score: string;
  showNew?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  const isTop = rank === "수석 동기";
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-full shrink-0 items-center gap-[12px] rounded-[16px] bg-surface-default px-[16px] py-[14px]",
        isTop ? "border-[1.5px] border-brand-accent" : "border border-line-default",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex size-[44px] shrink-0 items-center justify-center overflow-clip rounded-full",
          isTop ? "bg-brand-accent-tint" : "bg-brand-secondary-tint",
        )}
      >
        <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16 text-brand-secondary">
          {initial}
        </p>
      </div>
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip">
        <div className="relative flex max-w-full shrink-0 items-center gap-[6px] overflow-clip">
          <p className="relative min-w-0 truncate font-bold text-body-l-16">
            {name}
          </p>
          <RankLabel rank={rank} />
          {showNew && (
            <div className="relative flex shrink-0 items-start overflow-clip rounded-[4px] bg-brand-accent px-[6px] py-px">
              <p className="relative shrink-0 whitespace-nowrap font-medium text-caption-11">
                NEW
              </p>
            </div>
          )}
        </div>
        <p className="relative max-w-full shrink-0 truncate text-caption-12 text-text-secondary">
          {sub}
        </p>
      </div>
      <div className="relative flex shrink-0 flex-col items-end overflow-clip whitespace-nowrap">
        <p className="relative shrink-0 font-serif text-h2-22 font-black text-brand-secondary">
          {score}
        </p>
        <p className="relative shrink-0 font-medium text-caption-11 text-text-tertiary">
          궁합
        </p>
      </div>
    </Tap>
  );
}
