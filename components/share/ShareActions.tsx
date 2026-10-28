import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";

/**
 * Figma: Pattern/Share/Action Icon (73:2254…) + Action (74:3281…) +
 * Actions (74:4240). Each action has its own 56px disc colour.
 */
export type ShareActionKind =
  | "이미지 저장"
  | "카카오톡"
  | "인스타 스토리"
  | "링크 복사";

const ACTIONS: Record<ShareActionKind, { icon: string; disc: string }> = {
  "이미지 저장": { icon: "icon-download", disc: "bg-brand-secondary-tint" },
  카카오톡: { icon: "icon-kakao-share", disc: "bg-system-kakao" },
  "인스타 스토리": { icon: "icon-instagram", disc: "bg-brand-primary-tint" },
  "링크 복사": { icon: "icon-link", disc: "bg-bg-subtle" },
};

/** The order the frames lay the row out in. */
export const SHARE_ACTION_ORDER: ShareActionKind[] = [
  "이미지 저장",
  "카카오톡",
  "인스타 스토리",
  "링크 복사",
];

export function ShareAction({
  kind,
  onPress,
}: {
  kind: ShareActionKind;
  onPress?: () => void;
}) {
  const { icon, disc } = ACTIONS[kind];
  return (
    <Tap
      onPress={onPress}
      className="relative flex shrink-0 flex-col items-center gap-[8px] overflow-clip"
    >
      <div
        className={cn(
          "relative flex size-[56px] shrink-0 items-center justify-center overflow-clip rounded-full",
          disc,
        )}
      >
        <Icon name={icon} />
      </div>
      <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-secondary">
        {kind}
      </p>
    </Tap>
  );
}

export function ShareActions({
  onAction,
  className,
}: {
  onAction?: (kind: ShareActionKind) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-start justify-between overflow-clip px-[12px]",
        className,
      )}
    >
      {SHARE_ACTION_ORDER.map((kind) => (
        <ShareAction
          key={kind}
          kind={kind}
          onPress={onAction && (() => onAction(kind))}
        />
      ))}
    </div>
  );
}

/** Figma: Pattern/Share/Message Box (74:3359) + Message Text (74:3076). */
export function ShareMessageBox({
  caption = "기본 공유 문구",
  message,
  className,
}: {
  caption?: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center overflow-clip rounded-[12px] border border-line-default bg-surface-default py-[12px] pl-[16px] pr-[14px]",
        className,
      )}
    >
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip whitespace-nowrap font-medium">
        <p className="relative shrink-0 text-caption-11 text-text-tertiary">
          {caption}
        </p>
        <p className="relative shrink-0 text-body-m-14">{message}</p>
      </div>
    </div>
  );
}

export type ShareRatio = "스토리 9:16" | "카톡 1:1";

/** Figma: Pattern/Share/Ratio Toggle (73:2667). */
export function ShareRatioToggle({
  selected = "스토리 9:16",
  onChange,
  className,
}: {
  selected?: ShareRatio;
  onChange?: (ratio: ShareRatio) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-start gap-[8px] overflow-clip", className)}>
      {(["스토리 9:16", "카톡 1:1"] as const).map((label) => (
        <Tap
          key={label}
          onPress={onChange && (() => onChange(label))}
          className="relative shrink-0 rounded-full"
        >
          <Chip label={label} type={label === selected ? "primary" : "outline"} />
        </Tap>
      ))}
    </div>
  );
}
