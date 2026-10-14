import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/cn";

/** Figma: Pattern/Result/Element Row (74:2453) + Element Track (73:2808). */
export type ElementBar = {
  /** e.g. "木 목" */
  label: string;
  count: string;
  /** Track fill colour class, per element. */
  fillClass: string;
  /** 0–1 of the 200px track. */
  ratio: number;
};

export const ELEMENT_BARS: ElementBar[] = [
  { label: "木 목", count: "3", fillClass: "bg-brand-secondary", ratio: 1 },
  { label: "火 화", count: "2", fillClass: "bg-brand-primary", ratio: 1 },
  { label: "土 토", count: "1", fillClass: "bg-brand-accent", ratio: 1 },
  { label: "金 금", count: "1", fillClass: "bg-line-strong", ratio: 1 },
  { label: "水 수", count: "1", fillClass: "bg-brand-secondary-light", ratio: 1 },
];

function ElementRow({ label, count, fillClass, ratio }: ElementBar) {
  return (
    <div className="relative flex w-full shrink-0 items-center gap-[12px] overflow-clip">
      <p className="relative h-[20px] w-[52px] shrink-0 font-bold text-body-m-14">
        {label}
      </p>
      <div className="relative h-[10px] w-[200px] shrink-0 overflow-clip rounded-[5px] bg-bg-subtle">
        <div
          className={cn("absolute left-0 top-0 h-[10px] rounded-[5px]", fillClass)}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14 text-text-secondary">
        {count}
      </p>
    </div>
  );
}

/** Figma: Pattern/Result/Insight Box (73:2294). */
export function InsightBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 items-start overflow-clip rounded-[12px] bg-brand-secondary-tint px-[14px] py-[12px]",
        className,
      )}
    >
      <p className="relative shrink-0 text-caption-12 text-brand-secondary">
        {children}
      </p>
    </div>
  );
}

/** Figma: Pattern/Result/Element Distribution (74:4027). */
export function ElementDistribution({
  bars = ELEMENT_BARS,
  insight,
  className,
}: {
  bars?: ElementBar[];
  insight: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[14px] overflow-clip rounded-[20px] border border-line-default bg-surface-default p-[20px]",
        className,
      )}
    >
      <SectionTitle title="나의 오행 분포" caption="여덟 글자 속 다섯 기운의 비율" />
      {bars.map((bar) => (
        <ElementRow key={bar.label} {...bar} />
      ))}
      <InsightBox>{insight}</InsightBox>
    </div>
  );
}
