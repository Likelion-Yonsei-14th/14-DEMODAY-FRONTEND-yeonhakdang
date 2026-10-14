import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";

/**
 * Figma: Button — size=L (56px, Label/Button 17) | M (48px, Label/Button 15),
 * type=Primary (15:6) | Outline (15:46) | Kakao (15:70) | Ghost (15:62),
 * state=Default|Disabled.
 */
export function Button({
  label,
  type = "primary",
  size = "L",
  disabled = false,
  icon,
  className,
  onPress,
}: {
  label: string;
  type?: "primary" | "outline" | "ghost" | "kakao";
  size?: "L" | "M";
  disabled?: boolean;
  icon?: string;
  className?: string;
  onPress?: () => void;
}) {
  const surface = disabled
    ? "bg-line-default"
    : type === "primary"
      ? "bg-brand-primary"
      : type === "outline"
        ? "border-[1.5px] border-brand-secondary bg-surface-default"
        : type === "kakao"
          ? "bg-system-kakao"
          : "bg-transparent";

  const text = disabled
    ? "text-text-tertiary"
    : type === "primary"
      ? "text-text-inverse"
      : type === "kakao"
        ? "text-system-kakao-text"
        : type === "outline"
          ? "text-brand-secondary"
          : "text-text-secondary";

  return (
    <Tap
      onPress={disabled ? undefined : onPress}
      className={cn(
        "relative flex w-full items-center justify-center gap-[8px] rounded-[14px] px-[16px]",
        size === "L" ? "h-[56px]" : "h-[48px]",
        surface,
        className,
      )}
    >
      {icon && <Icon name={icon} size={20} />}
      <p
        className={cn(
          "relative shrink-0 whitespace-nowrap",
          size === "L" ? "text-label-button-17" : "text-label-button-15",
          text,
        )}
      >
        {label}
      </p>
    </Tap>
  );
}
