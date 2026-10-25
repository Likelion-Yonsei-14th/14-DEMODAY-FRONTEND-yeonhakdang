import { cn } from "@/lib/cn";

/**
 * Figma: Card/Major Rank — rank=1 (17:97) | 2 (17:109) | 3 (17:121).
 * Rank 1 gets the accent numeral and a 1.5px navy border; 2 and 3 use the
 * default hairline. `barRatio` is the fill width over the 309px inner width,
 * taken from the frame rather than derived from the score.
 */
export function CardMajorRank({
  rank,
  major,
  college,
  score,
  barRatio,
  reason,
  className,
}: {
  rank: 1 | 2 | 3;
  major: string;
  college: string;
  score: string;
  barRatio: number;
  reason?: string;
  className?: string;
}) {
  const isFirst = rank === 1;
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[10px] rounded-[16px] bg-surface-default px-[18px] py-[16px]",
        isFirst
          ? "border-[1.5px] border-brand-secondary"
          : "border border-line-default",
        className,
      )}
    >
      <div className="relative flex w-full shrink-0 items-center gap-[12px] overflow-clip whitespace-nowrap">
        <p
          className={cn(
            "relative shrink-0 font-serif text-score-28",
            isFirst ? "text-brand-accent" : "text-brand-secondary",
          )}
        >
          {rank}
        </p>
        <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip">
          <p className="relative shrink-0 font-bold text-body-l-16">{major}</p>
          <p className="relative w-full shrink-0 overflow-hidden text-ellipsis text-caption-12 text-text-secondary">
            {college}
          </p>
        </div>
        <div className="relative flex shrink-0 items-baseline gap-px overflow-clip text-brand-secondary">
          <p className="relative shrink-0 font-serif text-h2-22 font-black">{score}</p>
          <p className="relative shrink-0 text-[12px] font-bold leading-[18px]">점</p>
        </div>
      </div>
      <div className="relative h-[6px] w-full shrink-0 overflow-clip rounded-[3px] bg-brand-secondary-tint">
        <div
          className={cn(
            "absolute left-0 top-0 h-[6px] rounded-[3px]",
            isFirst ? "bg-brand-secondary" : "bg-brand-secondary-light",
          )}
          style={{ width: `${barRatio * 100}%` }}
        />
      </div>
      {reason && (
        <p className="relative w-full shrink-0 text-body-m-14 text-text-secondary">
          {reason}
        </p>
      )}
    </div>
  );
}
