import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { Icon } from "@/components/ui/Icon";
import { TitleCaption } from "@/components/ui/TitleCaption";
import { cn } from "@/lib/cn";

export type LoadingStepState = "done" | "active" | "pending";

/** Figma: Pattern/Loading/Step Row (74:3373) — 22px marker + title/caption. */
export function LoadingStepRow({
  state,
  title,
  caption,
  className,
}: {
  state: LoadingStepState;
  title: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex items-center gap-[12px] overflow-clip", className)}
    >
      {state === "done" ? (
        <BadgeIcon icon="icon-check-on-navy" size={22} tone="solid" />
      ) : state === "active" ? (
        <Icon name="step-active" size={22} />
      ) : (
        <div className="relative size-[22px] shrink-0 rounded-full border-[1.5px] border-line-strong" />
      )}
      <TitleCaption title={title} caption={caption} muted={state === "pending"} />
    </div>
  );
}
