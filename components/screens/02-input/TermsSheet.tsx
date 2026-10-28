"use client";

import { useState } from "react";

import { BottomSheet, BottomSheetHeader, Dim } from "@/components/layout/BottomSheet";
import { Anchored, Overlay, Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { LoginKakaoContent } from "@/components/screens/02-input/LoginKakao";
import { Button } from "@/components/ui/Button";
import { CheckboxRow } from "@/components/ui/CheckboxRow";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { USE_BACKEND, errorMessage, getPolicies, saveConsents } from "@/lib/backend";
import { openPolicy } from "@/lib/business";
import { syncLocker } from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

const TERMS = [
  { label: "[필수] 만 14세 이상이에요", required: true },
  { label: "[필수] 서비스 이용약관", required: true, href: "/terms" },
  { label: "[필수] 개인정보(생년월일·출생시간) 수집·이용", required: true, href: "/privacy" },
  { label: "[선택] 합격 기운·이벤트 소식 받기", required: false, href: "/privacy" },
];

/** Figma: 2-5 약관 동의 · 바텀시트 (최초 로그인) (22:377) */
export function TermsSheet() {
  const proto = useProto();
  // The frame shows the three 필수 items ticked; a real first login starts blank.
  const [checks, setChecks] = useState(() =>
    proto.active ? TERMS.map(() => false) : TERMS.map((t) => t.required),
  );
  const all = proto.active ? checks.every(Boolean) : true;
  const ready = TERMS.every((t, i) => !t.required || checks[i]);
  const [saving, setSaving] = useState(false);

  // Each item is stored on its own, against the server's current policy version.
  const agreeOnServer = async () => {
    setSaving(true);
    try {
      const { version } = await getPolicies();
      const [age14, terms, privacy, marketing] = checks;
      await saveConsents(version, { age14, terms, privacy, marketing });
      proto.update({ agreedTerms: true });
      await syncLocker(proto.update);
      proto.replace(proto.state.afterLogin);
      proto.toast("카카오로 로그인했어요");
    } catch (error) {
      proto.toast(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggle = (i: number) =>
    setChecks((c) => c.map((on, j) => (j === i ? !on : on)));

  return (
    <Screen>
      <LoginKakaoContent />

      <Overlay>
        <Dim />
        <Anchored from={286}>
          <BottomSheet top={364}>
            <BottomSheetHeader title="약관에 동의해 주세요" />

            {/* agreements (22:415) */}
            <div className="relative flex w-full shrink-0 flex-col items-start gap-[4px] overflow-clip px-[24px] pb-[16px]">
              {/* 전체 동의 (22:416) */}
              <Tap
                onPress={() => setChecks(TERMS.map(() => !all))}
                className="relative flex w-full shrink-0 items-center gap-[12px] overflow-clip rounded-[14px] bg-brand-secondary-tint px-[16px] py-[14px]"
              >
                <div
                  className={cn(
                    "relative flex size-[24px] shrink-0 items-center justify-center overflow-clip rounded-[6px]",
                    all
                      ? "bg-brand-secondary"
                      : "border-[1.5px] border-line-strong bg-surface-default",
                  )}
                >
                  {all && <Icon name="icon-check-lg" size={16} />}
                </div>
                <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
                  전체 동의하기
                </p>
              </Tap>
              <div className="h-[8px] w-[10px] shrink-0" />
              {TERMS.map((term, i) => (
                <CheckboxRow
                  key={term.label}
                  label={term.label}
                  checked={checks[i]}
                  showMore={!!term.href}
                  onToggle={() => toggle(i)}
                  onMore={() => term.href && openPolicy(term.href)}
                />
              ))}
            </div>

            <div className="relative flex shrink-0 flex-col items-start overflow-clip px-[24px] pb-[12px]">
              <p className="relative w-[345px] shrink-0 text-caption-12 text-text-tertiary">
                생년월일·출생시간은 사주 분석에만 쓰이며, 탈퇴 시 즉시 삭제돼요.
              </p>
            </div>

            <div className="relative flex shrink-0 flex-col items-start overflow-clip px-[24px] pb-[46px] pt-[4px]">
              <Button
                label={proto.state.afterInput || proto.state.afterLogin.startsWith("7-") ? "동의하고 구매 계속하기" : "동의하고 결과 보기"}
                disabled={!ready || saving}
                onPress={() => {
                  if (USE_BACKEND) return void agreeOnServer();
                  proto.update({ loggedIn: true, agreedTerms: true });
                  // Drop 2-4 and this sheet so back returns to where login began.
                  proto.go(proto.state.afterLogin, { pop: 2 });
                  proto.toast("카카오로 로그인했어요");
                }}
                className="w-[345px]"
              />
            </div>
          </BottomSheet>

          {/* 연학이 peeking over the sheet (14:50 · size L) */}
          <MascotFaceBadge
            size={96}
            className={cn(
              "absolute left-[273px] top-[286px] border-[3px]",
              proto.active && "proto-sheet-in",
            )}
          />
        </Anchored>
      </Overlay>
    </Screen>
  );
}
