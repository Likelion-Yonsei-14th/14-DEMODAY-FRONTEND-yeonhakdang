"use client";

import { DOCKED, Docked } from "@/components/layout/Screen";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { rosterScreen, useProto, type Proto } from "@/lib/proto";

/**
 * Figma: Bottom Nav (16:68).
 * Figma note — "결과 확인 이후 화면에 고정. 합격 궁합·귀인·부적은 유료 탭 →
 * 미구매 시 상품 상세, 구매 시 유료 결과로 이동."
 * The home indicator is baked into this bar, so screens using it do not also
 * render <HomeIndicator />. Each tab ships two exported glyphs; the active one
 * is the same name with an `-active` suffix.
 */
export const NAV_TABS = [
  { id: "major", label: "내 학과", icon: "nav-major" },
  { id: "list", label: "합격자 명단", icon: "nav-list" },
  { id: "compat", label: "합격 궁합", icon: "nav-compat" },
  { id: "benefactor", label: "귀인", icon: "nav-benefactor" },
  { id: "charm", label: "부적", icon: "nav-charm" },
] as const;

export type NavTabId = (typeof NAV_TABS)[number]["id"];

function openTab(proto: Proto, tab: NavTabId) {
  const { state } = proto;
  if (tab === "major") return proto.reset("3-4");
  if (tab === "list") return proto.reset(rosterScreen(proto));
  // Paid tabs: product detail until bought, the result afterwards.
  const result = { compat: "8-1", benefactor: "8-2", charm: "8-3" }[tab];
  if (state.purchased[tab]) return proto.reset(result);
  proto.openProduct(tab);
}

export function BottomNav({
  active,
  className,
}: {
  active: NavTabId;
  className?: string;
}) {
  const proto = useProto();
  return (
    <Docked>
      {(docked) => (
        <div
          className={cn(
            "relative flex h-[90px] w-full shrink-0 items-start justify-between border-t border-line-default bg-surface-default px-[8px] pb-[30px] pt-[4px]",
            className,
            docked && DOCKED,
          )}
        >
          {NAV_TABS.map(({ id, label, icon }) => (
            <Tap
              key={id}
              onPress={() => openTab(proto, id)}
              className="relative flex h-[56px] w-[70px] shrink-0 flex-col items-center justify-center gap-[4px]"
            >
              <Icon name={id === active ? `${icon}-active` : icon} />
              <p
                className={cn(
                  "relative shrink-0 whitespace-nowrap text-[11px] leading-[16px]",
                  id === active
                    ? "font-bold text-brand-primary"
                    : "font-medium text-text-tertiary",
                )}
              >
                {label}
              </p>
            </Tap>
          ))}
          <div className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-[3px] bg-text-primary" />
        </div>
      )}
    </Docked>
  );
}
