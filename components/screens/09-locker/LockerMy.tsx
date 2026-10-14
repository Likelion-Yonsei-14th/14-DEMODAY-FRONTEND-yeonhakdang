"use client";

import { HomeIndicator } from "@/components/chrome/HomeIndicator";
import { StatusBar } from "@/components/chrome/StatusBar";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { ListItem } from "@/components/pay/OrderRows";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import {
  INITIAL_STATE,
  PRODUCTS,
  displayName,
  rosterScreen,
  useProto,
  type ProductKind,
} from "@/lib/proto";

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
        <p className="relative shrink-0 text-caption-12 text-text-tertiary">
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

const PAID_ROWS: Array<{ kind: ProductKind; icon: string; bought: (relation: string) => string }> = [
  { kind: "compat", icon: "icon-crown-18", bought: () => "연세대 91점 · 구매 완료" },
  { kind: "benefactor", icon: "icon-user-18", bought: (relation) => `${relation} 귀인 · 구매 완료` },
  { kind: "charm", icon: "icon-image-18", bought: () => "금(金) 부적 · 구매 완료" },
];

/** Figma: 9-1 보관함 · 마이 (B-01~04) (34:1733) — a 914px-tall frame. */
export function LockerMy() {
  const proto = useProto();
  const { state } = proto;
  const name = displayName(state);
  const boughtCount = Object.values(state.purchased).filter(Boolean).length;

  const logout = () => {
    proto.reset("1-1", { ...INITIAL_STATE, agreedTerms: state.agreedTerms });
    proto.toast("로그아웃했어요");
  };

  const withdraw = () => {
    proto.reset("1-1", INITIAL_STATE);
    proto.toast("탈퇴했어요 · 모든 결과를 지웠어요");
  };

  return (
    <Screen height={914}>
      <StatusBar className="absolute left-0 top-0" />
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
              갑목 · 개척하는 리더형 · 카카오 로그인
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
            caption={state.analyzed ? "경영학과 · 94점" : "아직 분석 전이에요"}
            divider={false}
            onPress={() => proto.go(state.analyzed ? "3-4" : "2-1")}
          />
          <LockerRow
            icon="icon-user-18"
            title="동기 합격자 명단"
            caption={rosterScreen(proto) === "4-1" ? "동기 5명 · 수석 민지" : "아직 동기가 없어요"}
            onPress={() => proto.go(rosterScreen(proto))}
          />
          {PAID_ROWS.map(({ kind, icon, bought }) => {
            const owned = state.purchased[kind];
            return (
              <LockerRow
                key={kind}
                icon={icon}
                iconTone={owned ? "tint" : "subtle"}
                title={PRODUCTS[kind].name}
                caption={owned ? bought(state.relation) : "아직 받지 않았어요"}
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
            onPress={() => proto.toast("구매 내역은 준비 중이에요")}
          />
          <ListItem label="내 정보 수정" value="이름 · 생년월일" onPress={() => proto.go("2-1")} />
          <ListItem label="로그아웃" value="" onPress={logout} />
        </div>

        <Tap onPress={withdraw}>
          <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-tertiary underline [text-underline-position:from-font]">
            회원 탈퇴
          </p>
        </Tap>
      </div>

      <HomeIndicator className="absolute left-0 top-[880px]" />
    </Screen>
  );
}
