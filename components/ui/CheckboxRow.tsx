import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";

/** Figma: CheckboxRow (15:153) — state=On|Off, optional "보기" affordance. */
export function CheckboxRow({
  label,
  checked = false,
  showMore = false,
  onToggle,
  onMore,
  className,
}: {
  label: string;
  checked?: boolean;
  showMore?: boolean;
  onToggle?: () => void;
  onMore?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex h-[44px] w-full items-center gap-[12px]", className)}
    >
      <Tap
        onPress={onToggle}
        className="relative flex h-full min-w-px flex-1 items-center gap-[12px]"
      >
        <div
          className={cn(
            "relative flex size-[22px] shrink-0 items-center justify-center overflow-clip rounded-[6px]",
            checked
              ? "bg-brand-secondary"
              : "border-[1.5px] border-line-strong bg-surface-default",
          )}
        >
          {checked && <Icon name="icon-check" size={16} />}
        </div>
        <p className="relative min-w-px flex-1 text-body-m-14">{label}</p>
      </Tap>
      {showMore && (
        <Tap onPress={onMore} className="relative shrink-0">
          <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-tertiary underline [text-underline-position:from-font]">
            보기
          </p>
        </Tap>
      )}
    </div>
  );
}
