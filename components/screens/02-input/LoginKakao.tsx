"use client";

import Image from "next/image";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { Button } from "@/components/ui/Button";
import { BenefitList } from "@/components/ui/CheckRow";
import { Chip } from "@/components/ui/Chip";
import { Tap } from "@/components/ui/Tap";
import { Headline } from "@/components/ui/Headline";
import { trackLoginClick } from "@/lib/analytics";
import { USE_BACKEND } from "@/lib/backend";
import { useProto } from "@/lib/proto";

/**
 * The 2-4 login screen content. 2-5 lays a dim + 약관 bottom sheet over this
 * exact composition, so it is shared rather than duplicated.
 */
export function LoginKakaoContent() {
  const proto = useProto();
  const { state } = proto;
  const purchasing = Boolean(state.afterInput) || state.afterLogin.startsWith("7-");
  return (
    <>
      <TopBar title="" className="absolute left-0 top-[54px]" />

      <Headline
        className="absolute left-[24px] top-[118px]"
        overline="카카오 로그인"
        overlineTone="primary"
        size="h1"
        title={"카카오로 로그인하고\n연학당을 시작해요"}
        body={purchasing ? "카카오로 로그인하고 구매를 계속해요.\n선택한 상품과 가격은 그대로 유지돼요." : state.analyzed ? "로그인해도 지금 입력한 정보와\n분석 결과는 그대로 유지돼요." : "카카오로 로그인한 뒤 정보를 입력해요.\n무료 분석은 게스트로도 이용할 수 있어요."}
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
        {state.analyzed ? "지금 결과 그대로\n이어서 이용해!" : "무료 분석은\n게스트로도 가능해!"}
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
          "입력한 정보와 현재 분석 결과 그대로 유지",
          "다른 기기에서도 내 정보 · 친구 명단 유지",
          "구매한 유료 결과 언제든 다시 보기",
        ]}
      />

      {state.inviter && (
        <Chip
          className="absolute left-1/2 top-[638px] max-w-[345px] -translate-x-1/2"
          label={`${state.inviter.name}님의 초대가 이어져요 · 로그인 후 명단 자동 등록`}
        />
      )}

      <Bottom from={718}>
        <Button
          type="kakao"
          label="카카오로 3초 만에 시작하기"
          onPress={() => {
            trackLoginClick();
            // The real 카카오 login; 약관 (2-5) follows on return when needed.
            if (USE_BACKEND) {
              // Already logged in, only 약관 missing: no second trip to 카카오.
              if (state.loggedIn && !state.agreedTerms) return proto.replace("2-5");
              return proto.login();
            }
            // First login asks for 약관 consent; returning users go straight in.
            if (!state.agreedTerms) return proto.go("2-5");
            proto.update({ loggedIn: true });
            proto.go(state.afterLogin, { pop: 1 });
            proto.toast("카카오로 로그인했어요");
          }}
          className="absolute left-[24px] top-[718px] w-[345px]"
        />
        <Tap
          onPress={() => proto.replace(state.analyzed ? "3-4" : "2-1")}
          className="absolute left-[24px] top-[778px] flex h-[36px] w-[345px] items-center justify-center text-caption-12 text-text-secondary"
        >
          {state.analyzed ? "로그인 없이 현재 결과로 돌아가기" : "게스트로 무료 분석하기"}
        </Tap>
      </Bottom>
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
