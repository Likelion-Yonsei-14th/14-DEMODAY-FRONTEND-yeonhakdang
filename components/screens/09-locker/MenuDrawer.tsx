"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { StatusBar } from "@/components/chrome/StatusBar";
import { TopBar } from "@/components/chrome/TopBar";
import { Dim } from "@/components/layout/BottomSheet";
import { Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { MajorResultContent } from "@/components/screens/03-result/MajorResult";
import { HintText } from "@/components/ui/HintText";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { INITIAL_STATE, displayName, useProto } from "@/lib/proto";

/** Figma: Drawer menu rows (34:2128…) — icon + label + chevron. */
function DrawerRow({
  icon,
  label,
  caption,
  active = false,
  onPress,
}: {
  icon: string;
  label: string;
  caption?: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-[300px] shrink-0 items-center gap-[12px] overflow-clip py-[14px] pl-[20px] pr-[16px]",
        active && "bg-brand-secondary-tint",
      )}
    >
      <Icon name={icon} size={20} />
      {caption ? (
        <HintText
          title={label}
          caption={caption}
          captionTone="secondary"
          className="min-w-px flex-1"
        />
      ) : (
        <div className="relative flex min-w-px flex-1 flex-col items-start overflow-clip">
          <p className="relative shrink-0 whitespace-nowrap font-medium text-body-m-14">
            {label}
          </p>
        </div>
      )}
      <Icon name="icon-chevron-right-16" size={16} />
    </Tap>
  );
}

/**
 * Drawer (34:2117) — 300px wide, docked to the right edge. The prototype
 * shell lays this over whatever screen the 메뉴 glyph was tapped on.
 */
export function DrawerPanel({ onClose }: { onClose: () => void }) {
  const proto = useProto();
  const { state } = proto;
  // Navigate after the drawer closes so the target screen isn't covered.
  const then = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <div
      className={cn(
        "absolute left-[93px] top-0 flex h-[852px] w-[300px] flex-col items-start overflow-clip bg-bg-base pb-[34px] pt-[54px] shadow-sheet",
        proto.active && "proto-drawer-in",
      )}
    >
      <div className="relative flex w-[300px] shrink-0 items-start justify-end overflow-clip pb-[4px] pl-[20px] pr-[16px] pt-[12px]">
        <Tap label="메뉴 닫기" onPress={onClose} className="rounded-full">
          <Icon name="icon-close-bar" />
        </Tap>
      </div>

      <div className="relative flex w-[300px] shrink-0 items-center gap-[12px] overflow-clip px-[20px] pb-[20px] pt-[8px]">
        <MascotFaceBadge size={64} className="border-[3px]" />
        <div className="relative flex shrink-0 flex-col items-start gap-[2px] overflow-clip whitespace-nowrap">
          <p className="relative shrink-0 font-bold text-body-l-16">
            {state.name.trim() || !proto.active ? `${displayName(state)}님` : "반가워요!"}
          </p>
          <p className="relative shrink-0 text-caption-12 text-text-secondary">
            {state.analyzed ? "경영학과 · 개척하는 리더형" : "아직 내 학과를 찾지 않았어요"}
          </p>
        </div>
      </div>

      <div className="h-[8px] w-[300px] shrink-0 bg-bg-subtle" />

      <DrawerRow
        icon="icon-crown-20"
        label="보관함"
        caption="내 결과 · 구매한 결과 모아보기"
        active
        onPress={then(() => proto.requireLogin("9-1"))}
      />
      <DrawerRow icon="icon-user-20" label="내 정보 수정" onPress={then(() => proto.go("2-1"))} />
      <DrawerRow
        icon="icon-share-20"
        label="결과 공유하기"
        onPress={then(() =>
          state.analyzed ? proto.go("5-1") : proto.toast("먼저 내 학과를 찾아 주세요"),
        )}
      />
      <DrawerRow
        icon="icon-gift-20"
        label="유료 상품 · 3종 패키지"
        onPress={then(() => proto.openProduct("compat", "package"))}
      />
      <DrawerRow
        icon="icon-info-20"
        label="공지 · 자주 묻는 질문"
        onPress={then(() => proto.toast("공지 · FAQ는 준비 중이에요"))}
      />
      <DrawerRow
        icon="icon-lock-20"
        label="이용약관 · 개인정보 처리방침"
        onPress={then(() => proto.toast("약관 전문은 준비 중이에요"))}
      />

      <div className="min-h-px w-[10px] flex-1" />

      <Tap
        onPress={then(() => {
          if (!state.loggedIn) return proto.toast("아직 로그인하지 않았어요");
          proto.reset("1-1", { ...INITIAL_STATE, agreedTerms: state.agreedTerms });
          proto.toast("로그아웃했어요");
        })}
        className="relative flex shrink-0 items-center gap-[8px] overflow-clip py-[12px] pl-[20px]"
      >
        <Icon name="icon-logout" size={18} />
        <p className="relative shrink-0 whitespace-nowrap text-body-m-14 text-text-tertiary">
          로그아웃
        </p>
      </Tap>
    </div>
  );
}

/** Figma: 9-5 상단 메뉴 · 드로어 (보관함 진입) (34:2004) */
export function MenuDrawer() {
  const proto = useProto();
  return (
    <Screen>
      <StatusBar />
      <TopBar type="logo" right="icon-menu" />
      <MajorResultContent
        heroMascot={{ left: 195, top: 66, width: 150, height: 166.667 }}
      />
      <BottomNav active="major" className="absolute left-0 top-[762px]" />

      <Dim />
      <DrawerPanel onClose={proto.back} />
    </Screen>
  );
}
