import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { cn } from "@/lib/cn";

/** Figma: Pattern/Mascot Tip (73:2496) — face badge + left-tailed bubble. */
export function MascotTip({
  children,
  size = 64,
  className,
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex items-center gap-[6px] overflow-clip", className)}
    >
      <MascotFaceBadge size={size} className="border-[3px]" />
      <SpeechBubble tail="left" className="shrink-0">
        {children}
      </SpeechBubble>
    </div>
  );
}
