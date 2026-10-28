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
  | "카카오톡 공유"
  | "인스타 스토리"
  | "링크 복사";

const ACTIONS: Record<ShareActionKind, { icon: string; disc: string }> = {
  "이미지 저장": { icon: "icon-download", disc: "bg-brand-secondary-tint" },
  "카카오톡 공유": { icon: "icon-kakao-share", disc: "bg-system-kakao" },
  "인스타 스토리": { icon: "icon-instagram", disc: "bg-brand-primary-tint" },
  "링크 복사": { icon: "icon-link", disc: "bg-bg-subtle" },
};

/** The order the frames lay the row out in. */
export const SHARE_ACTION_ORDER: ShareActionKind[] = [
  "이미지 저장",
  "카카오톡 공유",
  "인스타 스토리",
  "링크 복사",
];

export function ShareAction({
  kind,
  onPress,
  busy = false,
}: {
  kind: ShareActionKind;
  onPress?: () => void;
  /** Working on it (making the image): a spinner replaces the icon. The
   *  button stays enabled — and keeps its pointer — the screen ignores repeats. */
  busy?: boolean;
}) {
  const { icon, disc } = ACTIONS[kind];
  return (
    <Tap
      onPress={onPress}
      label={busy ? `${kind} 준비 중` : undefined}
      className="relative flex shrink-0 flex-col items-center gap-[8px] overflow-clip"
    >
      <div
        className={cn(
          "relative flex size-[56px] shrink-0 items-center justify-center overflow-clip rounded-full",
          disc,
        )}
      >
        {busy ? (
          <div role="status" aria-label="이미지를 만들고 있어요" className="proto-spinner size-[24px] rounded-full border-[3px] border-line-default border-t-text-secondary" />
        ) : (
          <Icon name={icon} />
        )}
      </div>
      <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-secondary">
        {kind}
      </p>
    </Tap>
  );
}

export function ShareActions({
  onAction,
  busy,
  className,
}: {
  onAction?: (kind: ShareActionKind) => void;
  /** The action still working, if any. */
  busy?: ShareActionKind | null;
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
          busy={busy === kind}
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
