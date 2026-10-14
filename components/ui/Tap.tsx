"use client";

import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/**
 * A hotspot. Inside the prototype it renders a real <button>; in the static
 * gallery it renders the same box as a plain <div>, so the frames stay
 * pixel-identical and never nest interactive content inside the gallery links.
 */
export function Tap({
  onPress,
  disabled = false,
  label,
  className,
  style,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  /** Accessible name for icon-only hotspots. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const { active } = useProto();
  if (!active || !onPress) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      className={cn("proto-tap text-left", className)}
      style={style}
    >
      {children}
    </button>
  );
}
