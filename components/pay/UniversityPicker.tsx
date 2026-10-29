"use client";

import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/**
 * Figma: Pattern/University/Name (72:2174) — the matched part is tinted
 * brand-primary, the rest stays primary text.
 */
export function UniversityName({
  before = "",
  match,
  rest,
}: {
  before?: string;
  match: string;
  rest: string;
}) {
  return (
    <div className="relative flex shrink-0 items-start overflow-clip whitespace-nowrap font-bold text-body-m-14">
      {before && <p className="relative shrink-0">{before}</p>}
      <p className="relative shrink-0 text-brand-primary">{match}</p>
      <p className="relative shrink-0">{rest}</p>
    </div>
  );
}

/** Figma: Pattern/University/Search Row (74:3395) + Info (74:3055). */
export function UniversityRow({
  before,
  match,
  rest,
  campus,
  divider = true,
  added = false,
  onPress,
}: {
  before?: string;
  match: string;
  rest: string;
  campus: string;
  divider?: boolean;
  added?: boolean;
  onPress?: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-full shrink-0 items-center gap-[12px] overflow-clip py-[14px] pl-[16px] pr-[14px]",
        divider && "border-t border-line-default",
      )}
    >
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip whitespace-nowrap">
        <UniversityName before={before} match={match} rest={rest} />
        <p className="relative shrink-0 text-caption-12 text-text-tertiary">{campus}</p>
      </div>
      {added ? (
        <BadgeIcon icon="icon-check-on-navy" size={22} tone="solid" className="m-[5px]" />
      ) : (
        /* Pattern/Badge/Icon · 추가 (73:2241) */
        <div className="relative flex size-[32px] shrink-0 items-center justify-center overflow-clip rounded-[16px] bg-brand-secondary-tint">
          <Icon name="icon-plus" size={18} />
        </div>
      )}
    </Tap>
  );
}

/** Figma: Chip/University (17:280) — a selected university with a remove affordance. */
export function ChipUniversity({
  label,
  onRemove,
}: {
  label: string;
  onRemove?: () => void;
}) {
  return (
    <div className="relative flex shrink-0 items-center gap-[4px] rounded-full bg-brand-secondary py-[8px] pl-[14px] pr-[8px]">
      <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14 text-text-inverse">
        {label}
      </p>
      <Tap label={`${label} 빼기`} onPress={onRemove} className="relative shrink-0 rounded-full">
        <Icon name="icon-close-chip" size={18} />
      </Tap>
    </div>
  );
}

/** Figma: 대학 검색 (30:1448) — focused search field with a caret and clear. */
export function UniversitySearchField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const { active } = useProto();
  const live = active && onChange;
  return (
    <div
      className={cn(
        "relative flex h-[52px] w-full items-center gap-[10px] overflow-clip rounded-[12px] border-[1.5px] border-brand-secondary bg-surface-default px-[16px]",
        className,
      )}
    >
      <Icon name="icon-search" size={20} />
      {live ? (
        <input
          value={value}
          placeholder="대학 이름 검색"
          onChange={(e) => onChange(e.target.value)}
          className="relative min-w-px flex-1 bg-transparent text-body-l-input-16 outline-none placeholder:text-text-tertiary"
        />
      ) : (
        <>
          <p className="relative shrink-0 whitespace-nowrap text-body-l-input-16">{value}</p>
          <div className="h-[20px] w-[1.5px] shrink-0 bg-brand-secondary" />
          <div className="relative h-px min-w-px flex-1" />
        </>
      )}
      {(!live || value) && (
        <Tap
          label="검색어 지우기"
          onPress={onChange && (() => onChange(""))}
          className="relative shrink-0 rounded-full"
        >
          <Icon name="icon-close-field" size={18} />
        </Tap>
      )}
    </div>
  );
}
