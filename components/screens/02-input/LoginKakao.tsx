"use client";

import Image from "next/image";

import { HomeIndicator } from "@/components/chrome/HomeIndicator";
import { StatusBar } from "@/components/chrome/StatusBar";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { Button } from "@/components/ui/Button";
import { BenefitList } from "@/components/ui/CheckRow";
import { Chip } from "@/components/ui/Chip";
import { Headline } from "@/components/ui/Headline";
import { useProto } from "@/lib/proto";

/**
 * The 2-4 login screen content. 2-5 lays a dim + 약관 bottom sheet over this
 * exact composition, so it is shared rather than duplicated.
 */
export function LoginKakaoContent() {
  const proto = useProto();
  const { state } = proto;
  return (
    <>
      <StatusBar className="absolute left-0 top-0" />
      <TopBar title="" className="absolute left-0 top-[54px]" />

      <Headline
        className="absolute left-[24px] top-[118px]"
        overline="거의 다 왔어요"
        overlineTone="primary"
        size="h1"
        title={"결과를 저장하고\n동기 명단을 만들어요"}
        body={"카카오로 3초 만에 시작해요.\n입력한 정보는 그대로 이어서 분석해요."}
      />

      <div className="absolute left-[89.5px] top-[266px] size-[214px] opacity-45">
        <Image src="/assets/halo.png" alt="" width={214} height={214} className="block size-full" />
      </div>
      <Mascot
        pose="threeQuarter"
        className="absolute left-[98.5px] top-[280px]"
        width={196}
        height={178.807}
      />
      <SpeechBubble tail="bottom-left" className="absolute left-[222px] top-[270px]">
        {"로그인하면 바로\n사주 풀어줄게!"}
      </SpeechBubble>

      {/* Floating 오행 glyphs (22:350, 22:351) */}
      <p className="absolute left-[56px] top-[300px] whitespace-nowrap text-h3-18 text-brand-accent opacity-60">
        木
      </p>
      <p className="absolute left-[318px] top-[440px] whitespace-nowrap text-h3-18 text-brand-accent opacity-60">
        金
      </p>

      <BenefitList
        className="absolute left-[24px] top-[500px] w-[345px]"
        items={[
          "내 학과 결과를 계정에 안전하게 저장",
          "초대한 친구와 동기 명단 자동 연결",
          "구매한 유료 결과 언제든 다시 보기",
        ]}
      />

      {state.invited && (
        <Chip
          className="absolute left-[56px] top-[638px]"
          label="민지님의 초대가 이어져요 · 로그인 후 명단 자동 등록"
        />
      )}

      <Button
        type="kakao"
        label="카카오로 3초 만에 시작하기"
        onPress={() => {
          // First login asks for 약관 consent; returning users go straight in.
          if (!state.agreedTerms) return proto.go("2-5");
          proto.update({ loggedIn: true });
          proto.go(state.afterLogin, { pop: 1 });
          proto.toast("카카오로 로그인했어요");
        }}
        className="absolute left-[24px] top-[718px] w-[345px]"
      />
      <p className="absolute left-[24px] top-[786px] w-[345px] text-center text-caption-12 text-text-tertiary">
        처음이라면 약관 동의 후 바로 분석이 시작돼요
      </p>

      <HomeIndicator className="absolute left-0 top-[818px]" />
    </>
  );
}

/** Figma: 2-4 로그인 · 카카오 (22:319) */
export function LoginKakao() {
  return (
    <Screen>
      <LoginKakaoContent />
    </Screen>
  );
}
