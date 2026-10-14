import { cn } from "@/lib/cn";

export const FIVE_ELEMENTS = {
  목: "木",
  화: "火",
  토: "土",
  금: "金",
  수: "水",
} as const;

export type ElementKey = keyof typeof FIVE_ELEMENTS;

/** Figma: FiveElement (14:105…) — element=목|화|토|금|수, state=Default|Active. */
export function FiveElement({
  element,
  active = false,
  size = 52,
  className,
  style,
}: {
  element: ElementKey;
  active?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col items-center justify-center rounded-full",
        active
          ? "bg-brand-secondary text-text-inverse"
          : "border-[1.5px] border-brand-secondary bg-surface-default text-brand-secondary",
        className,
      )}
      style={{ width: size, height: size, ...style }}
    >
      <p className="relative shrink-0 font-serif text-[18px] font-black leading-[26px] tracking-[-0.108px]">
        {FIVE_ELEMENTS[element]}
      </p>
      <p className="relative shrink-0 font-medium text-caption-11">{element}</p>
    </div>
  );
}

/** Figma: Pattern/Landing/Five Elements Chips (73:2316). */
export function FiveElementsChips({
  active = "목",
  order = ["화", "수", "목", "금", "토"],
  size = 40,
  className,
}: {
  active?: ElementKey;
  order?: ElementKey[];
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-start gap-[10px] overflow-clip", className)}>
      {order.map((element) => (
        <FiveElement
          key={element}
          element={element}
          active={element === active}
          size={size}
        />
      ))}
    </div>
  );
}
