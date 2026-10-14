import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Figma: Pattern/Badge/Icon — 20px tinted (72:2206) and 22px solid (72:2237).
 * The glyph asset already carries its colour, so `tone` only sets the disc.
 */
export function BadgeIcon({
  icon = "icon-check-tint",
  size = 20,
  glyphSize = 14,
  tone = "tint",
  className,
}: {
  icon?: string;
  size?: 20 | 22;
  /** The exported glyph size inside the disc (13–14px across the frames). */
  glyphSize?: number;
  tone?: "tint" | "solid";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-clip rounded-full",
        tone === "solid" ? "bg-brand-secondary" : "bg-brand-secondary-tint",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name={icon} size={glyphSize} />
    </div>
  );
}
