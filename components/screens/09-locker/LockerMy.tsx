"use client";

import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { ListItem } from "@/components/pay/OrderRows";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { deleteAccount, signOut } from "@/lib/account";
import { cn } from "@/lib/cn";
import {
  PRODUCTS,
  displayName,
  owns,
  rosterScreen,
  useProto,
  type ProductKind,
} from "@/lib/proto";
import { USE_BACKEND } from "@/lib/backend";
import { useAnalysis } from "@/lib/useAnalysis";
import { elementLabel } from "@/lib/saju";
import { useCharmResult, useCompatResult } from "@/lib/usePaid";
import { useRoster } from "@/lib/useRoster";

/**
 * Figma: Pattern/Locker/Result Row (74:2567) — 36px badge + title/caption and
 * either a chevron or a CTA chip.
 */
function LockerRow({
  icon,
  iconTone = "tint",
  title,
  caption,
  cta,
  divider = true,
  onPress,
}: {
  icon: string;
  iconTone?: "tint" | "subtle";
  title: string;
  caption: string;
  cta?: string;
  divider?: boolean;
  onPress?: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-full shrink-0 items-center gap-[12px] overflow-clip py-[14px] pl-[16px] pr-[12px]",
        divider && "border-t border-line-default",
      )}
    >
      <div
        className={cn(
          "relative flex size-[36px] shrink-0 items-center justify-center overflow-clip rounded-[12px]",
          iconTone === "subtle" ? "bg-bg-subtle" : "bg-brand-secondary-tint",
        )}
      >
        <Icon name={icon} size={18} />
      </div>
      <div className="relative flex min-w-px flex-1 flex-col items-start overflow-clip whitespace-nowrap">
        <p className="relative shrink-0 font-bold text-body-m-14">{title}</p>
        <p className="relative max-w-full shrink-0 truncate text-caption-12 text-text-tertiary">
          {caption}
        </p>
      </div>
      {cta ? (
        <Chip type="primary" label={cta} />
      ) : (
        <Icon name="icon-chevron-right-18" size={18} />
      )}
    </Tap>
  );
}

const PAID_ROWS: Array<{ kind: ProductKind; icon: string }> = [
  { kind: "compat", icon: "icon-crown-18" },
  { kind: "benefactor", icon: "icon-user-18" },
  { kind: "charm", icon: "icon-image-18" },
];

/** Figma: 9-1 보관함 · 마이 (B-01~04) (34:1733) — a 914px-tall frame. */
export function LockerMy() {
  const proto = useProto();
  const { state } = proto;
  const roster = useRoster();
  const name = displayName(state);
  const analysis = useAnalysis();
  const boughtCount = Object.values(state.purchased).filter(Boolean).length;
  const compat = useCompatResult().universities[0];
  const charm = useCharmResult();
  // What each owned result holds, and how it was opened (구매 or 이용권 code).
  const how = (kind: ProductKind) => (state.purchased[kind] ? "구매 완료" : "이용권");
  const summary: Record<ProductKind, string> = {
    compat: `${compat.name.replace(/학교$/, "")} ${compat.score}점`,
    benefactor: `${state.relation} 귀인`,
    charm: `${elementLabel(charm.element)} 부적`,
  };

  const logout = () => void signOut(proto);
  const withdraw = () => void deleteAccount(proto);

  return (
    <Screen height={914}>
      <TopBar title="보관함" className="absolute left-0 top-[54px]" />

      {/* content (34:1753) */}
      <div className="absolute left-0 top-[106px] flex w-[393px] flex-col items-start gap-[16px] overflow-clip px-[24px] pb-[48px] pt-[8px]">
        {/* 프로필 (34:1754) */}
        <div className="relative flex w-[345px] shrink-0 items-center gap-[14px] overflow-clip rounded-[18px] bg-brand-secondary px-[18px] py-[16px]">
          <div className="relative flex size-[48px] shrink-0 items-center justify-center overflow-clip rounded-full bg-brand-accent">
            <p className="relative shrink-0 whitespace-nowrap text-h3-18 text-text-inverse">
              {name[0]}
            </p>
          </div>
          <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip whitespace-nowrap">
            <p className="relative shrink-0 font-bold text-body-l-16 text-text-inverse">
              {name}
            </p>
            <p className="relative shrink-0 text-caption-12 text-brand-accent-tint">
              {state.loggedIn ? "카카오 로그인됨" : "게스트 이용 중"}
            </p>
          </div>
          <Tap label="내 정보 수정" onPress={() => proto.go("2-1")} className="rounded-full">
            <Icon name="icon-edit" size={20} />
          </Tap>
        </div>

        <p className="relative shrink-0 whitespace-nowrap text-h3-18">내 결과</p>

        {/* 내 결과 (B-01) (34:1763) */}
        <div className="relative flex w-[345px] shrink-0 flex-col items-start overflow-clip rounded-[16px] border border-line-default bg-surface-default">
          <LockerRow
            icon="icon-crown-18"
            title="내 학과 결과"
            caption={state.analyzed ? `${analysis.top[0].major.대표학과[0]} · ${analysis.top[0].display}점` : "아직 분석 전이에요"}
            divider={false}
            onPress={() => proto.go(state.analyzed ? "3-4" : "2-1")}
          />
          <LockerRow
            icon="icon-user-18"
            title="동기 합격자 명단"
            caption={
              rosterScreen(proto) === "4-1" && roster.entries[0]
                ? `동기 ${roster.entries.length}명 · 수석 ${roster.entries[0].name}`
                : "아직 동기가 없어요"
            }
            onPress={() => proto.requireLogin(rosterScreen(proto))}
          />
          {PAID_ROWS.map(({ kind, icon }) => {
            const owned = owns(state, kind);
            return (
              <LockerRow
                key={kind}
                icon={icon}
                iconTone={owned ? "tint" : "subtle"}
                title={PRODUCTS[kind].name}
                caption={owned ? USE_BACKEND && state.purchased[kind] ? "구매 당시 저장된 결과 다시 보기" : `${summary[kind]} · ${how(kind)}` : "아직 받지 않았어요"}
                cta={owned ? undefined : "구매하기"}
                onPress={() =>
                  owned ? proto.go(PRODUCTS[kind].result) : proto.openProduct(kind)
                }
              />
            );
          })}
        </div>

        <p className="relative shrink-0 whitespace-nowrap text-h3-18">계정</p>

        {/* 계정 (B-02~04) (34:1810) */}
        <div className="relative flex w-[345px] shrink-0 flex-col items-start overflow-clip rounded-[16px] border border-line-default bg-surface-default">
          <ListItem
            label="구매 내역"
            value={`${boughtCount}건`}
            onPress={() => proto.go("10-2")}
          />
          <ListItem label="내 정보 수정" value="이름 · 생년월일" onPress={() => proto.go("2-1")} />
          <ListItem label={state.loggedIn ? "로그아웃" : "카카오 로그인"} value="" onPress={state.loggedIn ? logout : () => proto.requireLogin(state.analyzed ? "3-4" : "2-1")} />
        </div>

        <Tap onPress={withdraw}>
          <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-tertiary underline [text-underline-position:from-font]">
            회원 탈퇴
          </p>
        </Tap>
      </div>
    </Screen>
  );
}
