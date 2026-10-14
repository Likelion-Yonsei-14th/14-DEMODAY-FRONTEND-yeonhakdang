"use client";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { Button } from "@/components/ui/Button";
import { useProto } from "@/lib/proto";

/** Figma: 9-2 네트워크 오류 (C-06) (34:1835) */
export function NetworkError() {
  const proto = useProto();
  return (
    <Screen>
      <TopBar type="logo" right="icon-menu" className="absolute left-0 top-[54px]" />

      <Mascot
        pose="tablet"
        className="absolute left-[103.5px] top-[200.49px]"
        width={186}
        height={182.951}
      />
      <SpeechBubble tail="bottom-left" className="absolute left-[232px] top-[146px]">
        {"어? 하늘길이\n끊겼나 봐!"}
      </SpeechBubble>

      <p className="absolute left-[75px] top-[410px] whitespace-nowrap font-serif text-h2-22">
        인터넷 연결이 불안정해요
      </p>
      <div className="absolute left-[24px] top-[448px] w-[345px] whitespace-pre-line text-center text-body-m-14 text-text-secondary">
        {"와이파이나 데이터 연결을 확인한 뒤\n다시 시도해 주세요. 입력한 정보는 그대로예요."}
      </div>

      <Bottom from={718}>
        <Button
          label="다시 시도하기"
          onPress={() => {
            proto.toast("다시 연결됐어요");
            proto.back();
          }}
          className="absolute left-[24px] top-[718px] w-[345px]"
        />
      </Bottom>
    </Screen>
  );
}
