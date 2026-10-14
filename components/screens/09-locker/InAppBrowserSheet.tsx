"use client";

import { HomeIndicator } from "@/components/chrome/HomeIndicator";
import { BottomSheet, BottomSheetHeader, Dim } from "@/components/layout/BottomSheet";
import { Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { LandingContent } from "@/components/screens/01-landing/Landing";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/**
 * Figma: 9-4 인앱 브라우저 안내 · 바텀시트 (C-07) (34:1907)
 * Opens over the current screen when the prototype detects a 카카오톡 /
 * 인스타그램 in-app browser (or from the demo panel); every exit closes it.
 */
export function InAppBrowserSheet() {
  const proto = useProto();
  const continueAsFriend = proto.back;
  const openSafari = () => {
    proto.toast("Safari에서 열었어요");
    proto.back();
  };
  return (
    <Screen>
      <LandingContent elementOrder={["목", "화", "토", "금", "수"]} />

      <Dim onPress={continueAsFriend} />

      <BottomSheet top={460}>
        <BottomSheetHeader title="외부 브라우저에서 열어 주세요" onClose={continueAsFriend} />

        <div className="relative flex w-full shrink-0 flex-col items-start gap-[16px] overflow-clip px-[24px] pb-[8px]">
          <p className="relative w-[345px] shrink-0 text-body-m-14 text-text-secondary">
            카카오톡·인스타그램 앱 안에서는 로그인, 결제, 이미지 저장이 막힐 수
            있어요. Safari나 Chrome에서 열면 더 안정적이에요.
          </p>
          {/* 방법 (34:1948) */}
          <div className="relative flex w-[345px] shrink-0 items-center gap-[10px] overflow-clip rounded-[14px] bg-bg-subtle px-[16px] py-[14px]">
            <div className="relative flex size-[32px] shrink-0 items-center justify-center overflow-clip rounded-[8px] bg-surface-default">
              <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
                ⋯
              </p>
            </div>
            <p className="relative shrink-0 whitespace-nowrap font-medium text-body-m-14">
              오른쪽 위 ⋯ 메뉴 → ‘다른 브라우저로 열기’
            </p>
          </div>
        </div>

        <div className="relative flex w-full shrink-0 flex-col items-center gap-[6px] overflow-clip px-[24px] pb-[40px] pt-[12px]">
          <Button label="Safari로 열기" onPress={openSafari} className="w-[345px]" />
          <Button
            label="이대로 계속하기"
            type="ghost"
            size="M"
            onPress={continueAsFriend}
            className="w-[200px]"
          />
        </div>
      </BottomSheet>

      {/* 연학이 peeking over the sheet (14:50 · size L) */}
      <MascotFaceBadge
        size={96}
        className={cn(
          "absolute left-[24px] top-[382px] border-[3px]",
          proto.active && "proto-sheet-in",
        )}
      />
      <SpeechBubble
        tail="left"
        className={cn("absolute left-[126px] top-[394px]", proto.active && "proto-sheet-in")}
      >
        {"여기선 내가 잘\n안 보일 수도 있어!"}
      </SpeechBubble>

      <HomeIndicator className="absolute left-0 top-[818px]" />
    </Screen>
  );
}
