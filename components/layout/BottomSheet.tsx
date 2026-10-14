"use client";

import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/**
 * Figma: dim (e.g. 22:406) — full-bleed scrim behind a sheet. In the
 * prototype tapping it dismisses (pops the sheet) unless told otherwise.
 */
export function Dim({
  onPress,
  className,
}: {
  onPress?: () => void;
  className?: string;
}) {
  const proto = useProto();
  return (
    <Tap
      label="닫기"
      onPress={onPress ?? proto.back}
      className={cn(
        "absolute inset-0 bg-[#161a23] opacity-55",
        proto.active && "proto-fade-in cursor-default",
        className,
      )}
    />
  );
}

/** Figma: Bottom Sheet/Header (16:201) — grab handle + title row + close. */
export function BottomSheetHeader({
  title,
  onClose,
  className,
}: {
  title: string;
  onClose?: () => void;
  className?: string;
}) {
  const proto = useProto();
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-center gap-[14px] rounded-t-[24px] bg-surface-default pb-[8px] pt-[10px]",
        className,
      )}
    >
      <div className="h-[4px] w-[40px] shrink-0 rounded-[2px] bg-line-strong" />
      <div className="relative flex w-full shrink-0 items-center overflow-clip pl-[24px] pr-[12px]">
        <p className="relative min-w-px flex-1 font-serif text-h2-22">{title}</p>
        <Tap
          label="닫기"
          onPress={onClose ?? proto.back}
          className="relative flex size-[44px] shrink-0 items-center justify-center overflow-clip rounded-full"
        >
          <Icon name="icon-close" />
        </Tap>
      </div>
    </div>
  );
}

/** Figma: Bottom Sheet (e.g. 22:407) — rounded sheet docked to the bottom. */
export function BottomSheet({
  top,
  children,
  className,
}: {
  /** Absolute y offset inside the 852px screen, as laid out in Figma. */
  top: number;
  children: React.ReactNode;
  className?: string;
}) {
  const { active } = useProto();
  return (
    <div
      className={cn(
        "absolute left-0 flex w-full flex-col items-start overflow-clip rounded-t-[24px] bg-surface-default shadow-sheet",
        active && "proto-sheet-in",
        className,
      )}
      style={{ top }}
    >
      {children}
    </div>
  );
}
