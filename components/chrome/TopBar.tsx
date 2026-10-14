"use client";

import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/**
 * Figma: TopBar — type=Logo (16:36) | Back (16:44) | Close (16:52).
 * Height 52. The trailing slot is omitted entirely when unused, which is what
 * shifts a centred title slightly off-centre — matching the frames.
 * In the prototype the back glyph pops the stack and the menu glyph opens
 * the drawer unless a handler is passed.
 */
export function TopBar({
  type = "back",
  title,
  right,
  backIcon = "icon-back",
  onBack,
  onRight,
  className,
}: {
  type?: "logo" | "back" | "close";
  title?: string;
  /** Icon name for the trailing 44×44 slot; omit to hide it. */
  right?: string;
  /** Leading glyph; the product heroes use the white-on-navy export. */
  backIcon?: string;
  onBack?: () => void;
  onRight?: () => void;
  className?: string;
}) {
  const proto = useProto();
  const rightAction =
    onRight ?? (right?.startsWith("icon-menu") ? proto.openMenu : proto.back);

  return (
    <div
      className={cn(
        "relative flex h-[52px] w-full shrink-0 items-center gap-[4px] px-[12px]",
        className,
      )}
    >
      {type === "logo" ? (
        <div className="relative flex min-w-px flex-1 items-center gap-[8px] overflow-clip pl-[8px]">
          <MascotFaceBadge size={32} className="border-2" />
          <p className="whitespace-nowrap font-serif text-[18px] font-black leading-[26px] tracking-[-0.108px]">
            연학당
          </p>
        </div>
      ) : (
        <>
          {type === "back" ? (
            <Tap
              label="뒤로"
              onPress={onBack ?? proto.back}
              className="relative flex size-[44px] shrink-0 items-center justify-center overflow-clip rounded-full"
            >
              <Icon name={backIcon} />
            </Tap>
          ) : (
            /* type=Close keeps an empty leading slot so the title stays centred. */
            <div className="relative size-[44px] shrink-0" />
          )}
          <p className="relative min-w-px flex-1 text-center font-bold text-body-l-16">
            {title}
          </p>
        </>
      )}
      {right && (
        <Tap
          label={right.startsWith("icon-menu") ? "메뉴" : "닫기"}
          onPress={rightAction}
          className="relative flex size-[44px] shrink-0 items-center justify-center overflow-clip rounded-full"
        >
          <Icon name={right} />
        </Tap>
      )}
    </div>
  );
}
