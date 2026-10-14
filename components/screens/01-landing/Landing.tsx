"use client";

import Image from "next/image";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { FiveElementsChips, type ElementKey } from "@/components/saju/FiveElement";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { TrustStats } from "@/components/ui/TrustStats";
import { useProto } from "@/lib/proto";

/**
 * The 1-1 landing composition. 9-4 lays an in-app-browser sheet over the same
 * screen but orders the 오행 chips differently, so the order is a prop.
 */
export function LandingContent({
  elementOrder = ["화", "수", "목", "금", "토"],
}: {
  elementOrder?: ElementKey[];
}) {
  const proto = useProto();
  return (
    <>
      <TopBar type="logo" right="icon-menu" className="absolute left-0 top-[54px]" />

      {/* Celestial backdrop — moon sits under the dotted orbit, both under 연학이. */}
      <div className="absolute left-[58px] top-[322px] size-[276px]">
        <Image src="/assets/moon.svg" alt="" width={276} height={276} unoptimized className="block size-full" />
      </div>
      <div className="absolute left-[36px] top-[300px] size-[320px]">
        <Image src="/assets/orbit.png" alt="" width={320} height={320} className="block size-full" />
      </div>

      <Headline
        className="absolute left-0 top-[122px] w-[393px] px-[24px]"
        overline="2027 대입 · 수험생 전용"
        title={"타고난 사주로\n나의 학과를 찾다"}
        body={"생년월일시만 입력하면 오행으로 풀어낸\n적합 학과 TOP 3를 알려줘요"}
      />

      <Mascot
        className="absolute left-[90px] top-[348px]"
        width={212}
        height={243.279}
      />
      <SpeechBubble tail="bottom-left" className="absolute left-[196px] top-[304px]">
        {"생년월일만 알려줘,\n내가 사주를 읽어줄게!"}
      </SpeechBubble>

      <FiveElementsChips
        active="목"
        order={elementOrder}
        className="absolute left-[24px] top-[572px]"
      />

      <TrustStats
        className="absolute left-[24px] top-[632px] w-[345px]"
        stats={[
          { value: "만세력", label: "정밀 계산" },
          { value: "120+", label: "학과 매핑" },
          { value: "1분", label: "검사 소요" },
        ]}
      />

      <Bottom from={718}>
        <Button
          label="무료로 내 학과 찾기"
          onPress={() => {
            proto.update({ invited: false });
            proto.go("2-1");
          }}
          className="absolute left-[24px] top-[718px] w-[345px]"
        />
        <p className="absolute left-[24px] top-[786px] w-[345px] text-center text-caption-12 text-text-secondary">
          지금까지 12,480명이 내 학과를 찾았어요
        </p>
      </Bottom>
    </>
  );
}

/** Figma: 1-1 랜딩 (19:108) */
export function Landing() {
  return (
    <Screen>
      <LandingContent />
    </Screen>
  );
}
