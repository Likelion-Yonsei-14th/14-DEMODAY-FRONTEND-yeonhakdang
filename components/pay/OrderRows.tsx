import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";

/**
 * Figma: Pattern/Order/Price Row (72:2187) — a label/value pair on one line.
 * `emphasis` matches the 결제 취소 row, which prints its value in brand-primary.
 */
export function PriceRow({
  label,
  value,
  emphasis = false,
  className,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-[309px] shrink-0 items-center justify-between overflow-clip whitespace-nowrap text-body-m-14",
        className,
      )}
    >
      <p className="relative shrink-0 text-text-secondary">{label}</p>
      <p
        className={cn(
          "relative shrink-0",
          emphasis ? "font-bold text-brand-primary" : "font-medium",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Figma: List Item (17:273) — icon + label + value + chevron. */
export function ListItem({
  label,
  value,
  icon = "icon-list-item",
  onPress,
  className,
}: {
  label: string;
  value: string;
  icon?: string;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-full shrink-0 items-center gap-[12px] px-[4px] py-[16px]",
        className,
      )}
    >
      <Icon name={icon} size={22} />
      <p className="relative min-w-px flex-1 text-body-l-input-16">{label}</p>
      <p className="relative shrink-0 whitespace-nowrap text-body-m-14 text-text-tertiary">
        {value}
      </p>
      <Icon name="icon-chevron-right" size={20} />
    </Tap>
  );
}
