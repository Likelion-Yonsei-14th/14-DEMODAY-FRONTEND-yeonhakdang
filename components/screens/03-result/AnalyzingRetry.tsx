"use client";

import { HomeIndicator } from "@/components/chrome/HomeIndicator";
import { StatusBar } from "@/components/chrome/StatusBar";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { Button } from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { useProto } from "@/lib/proto";

/** Figma: 3-2 분석 지연 · 재시도 (A-06 / C-06) (24:475) */
export function AnalyzingRetry() {
  const proto = useProto();
  return (
    <Screen>
      <StatusBar className="absolute left-0 top-0" />
      <TopBar type="close" title="" className="absolute left-0 top-[54px]" />

      <Mascot
        pose="worried"
        className="absolute left-[101.5px] top-[229.84px]"
        width={190}
        height={168.197}
      />
      <SpeechBubble tail="bottom-left" className="absolute left-[222px] top-[150px]">
        {"으음… 별자리가\n잠깐 흐려졌어"}
      </SpeechBubble>

      <p className="absolute left-[62px] top-[420px] whitespace-nowrap font-serif text-h2-22">
        분석이 조금 늦어지고 있어요
      </p>
      <div className="absolute left-[24px] top-[458px] w-[345px] whitespace-pre-line text-center text-body-m-14 text-text-secondary">
        {"입력한 정보는 그대로 저장돼 있어요.\n잠시 후 다시 시도해 주세요."}
      </div>

      <InfoBox tone="warning" className="absolute left-[24px] top-[520px] w-[345px]">
        30초 이상 응답이 없으면 자동으로 한 번 더 시도해요
      </InfoBox>

      <Button
        label="다시 분석하기"
        onPress={() => proto.replace("3-1")}
        className="absolute left-[24px] top-[700px] w-[345px]"
      />
      <Button
        label="처음 화면으로"
        onPress={() => proto.reset("1-1")}
        type="ghost"
        size="M"
        className="absolute left-[96.5px] top-[762px] w-[200px]"
      />

      <HomeIndicator className="absolute left-0 top-[818px]" />
    </Screen>
  );
}
