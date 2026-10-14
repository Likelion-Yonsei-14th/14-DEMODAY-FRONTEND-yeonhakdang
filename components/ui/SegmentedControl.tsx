import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";

/** Figma: Segmented Control (15:136) — two options, selected=First|Second. */
export function SegmentedControl({
  options,
  selected = 0,
  onChange,
  className,
}: {
  options: [string, string];
  selected?: 0 | 1;
  onChange?: (index: 0 | 1) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[48px] w-full items-stretch gap-[4px] rounded-[12px] bg-bg-subtle p-[4px]",
        className,
      )}
    >
      {options.map((option, i) => {
        const isOn = i === selected;
        return (
          <Tap
            key={option}
            onPress={onChange && (() => onChange(i as 0 | 1))}
            className={cn(
              "relative flex min-w-px flex-1 items-center justify-center overflow-clip rounded-[9px] transition-colors",
              isOn && "bg-surface-default shadow-card",
            )}
          >
            <p
              className={cn(
                "relative shrink-0 whitespace-nowrap text-body-m-14",
                isOn
                  ? "font-bold text-brand-secondary"
                  : "font-medium text-text-secondary",
              )}
            >
              {option}
            </p>
          </Tap>
        );
      })}
    </div>
  );
}

/** Figma: Pattern/Form/Segmented Field (74:4180) — label + segmented control. */
export function SegmentedField({
  label,
  options,
  selected = 0,
  onChange,
  className,
}: {
  label: string;
  options: [string, string];
  selected?: 0 | 1;
  onChange?: (index: 0 | 1) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col items-start gap-[8px]", className)}>
      <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
        {label}
      </p>
      <SegmentedControl
        options={options}
        selected={selected}
        onChange={onChange}
        className="w-[166px]"
      />
    </div>
  );
}
