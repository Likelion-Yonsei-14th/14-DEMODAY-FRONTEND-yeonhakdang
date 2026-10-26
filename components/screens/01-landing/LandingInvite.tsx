"use client";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { NumberedRow } from "@/components/ui/StepNumber";
import { josa } from "@/lib/josa";
import { FIGMA_STATE, useProto } from "@/lib/proto";
import { analyzeBirth } from "@/lib/saju";

/** Past this many letters the bubble's line gets shorter to keep its width. */
const LONG_NAME = 4;

/** Figma: 1-2 랜딩 · 초대 링크 진입 (19:174) */
export function LandingInvite() {
  const proto = useProto();
  // 1-2 only opens through a valid link; the Figma 민지 stands in otherwise.
  const inviter = proto.state.inviter ?? FIGMA_STATE.inviter!;
  const name = inviter.name;
  const result = analyzeBirth(inviter);
  const pick = result.ok
    ? `${result.analysis.top[0].major.대표학과[0]} (${result.analysis.dayMaster.type})`
    : undefined;
  return (
    <Screen>
      <TopBar type="logo" right="icon-menu" className="absolute left-0 top-[54px]" />

      {/* invite card (19:194) */}
      <div className="absolute left-[24px] top-[122px] flex w-[345px] flex-col items-start gap-[14px] overflow-clip rounded-[20px] bg-brand-secondary p-[20px]">
        <div className="relative flex shrink-0 items-center gap-[12px] overflow-clip">
          <div className="relative flex size-[48px] shrink-0 items-center justify-center overflow-clip rounded-full bg-surface-default">
            <p className="relative shrink-0 whitespace-nowrap text-h3-18 text-brand-secondary">
              {name.slice(0, 1)}
            </p>
          </div>
          <div className="relative flex shrink-0 flex-col items-start gap-[2px] overflow-clip whitespace-nowrap font-bold text-text-inverse">
            <p className="relative shrink-0 text-[12px] leading-[18px]">
              {name}님이 초대했어요
            </p>
            <div className="relative shrink-0 whitespace-pre-line font-serif text-h2-22">
              {"동기 합격자 명단에\n초대됐어요"}
            </div>
          </div>
        </div>
        <div className="relative flex w-full shrink-0 items-center gap-[8px] overflow-clip rounded-[12px] bg-surface-default px-[14px] py-[12px]">
          <Icon name="icon-crown" size={18} />
          <p className="relative min-w-0 truncate text-[12px] font-bold leading-[18px] text-brand-secondary">
            {pick ? `${name}의 1위 학과 · ${pick}` : `${name}님의 명단에 함께 올라가요`}
          </p>
        </div>
      </div>

      <Mascot
        pose="greet"
        className="absolute left-[102px] top-[390.84px] rounded-[24px] bg-bg-base"
        width={190}
        height={161.189}
      />
      <SpeechBubble tail="bottom-left" className="absolute left-[180px] top-[300px]">
        {name.length > LONG_NAME
          ? `너도 학과 찾고\n${josa(name, "이랑/랑")} 궁합 볼래?`
          : `너도 사주로 학과 찾고\n${josa(name, "이랑/랑")} 궁합도 확인해볼래?`}
      </SpeechBubble>

      {/* how it works (19:214) */}
      <div className="absolute left-[24px] top-[566px] flex w-[345px] flex-col items-start gap-[10px] overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[18px] py-[16px]">
        <NumberedRow n={1}>생년월일시 입력하고 내 학과 TOP 3 확인</NumberedRow>
        <NumberedRow n={2}>{name}님이 내 명단에 자동 등록</NumberedRow>
        <NumberedRow n={3}>궁합 점수로 정해지는 동기 석차 확인</NumberedRow>
      </div>

      <Bottom from={718}>
        <Button
          label="나도 내 학과 찾고 명단 합류하기"
          onPress={() => proto.go("2-1")}
          className="absolute left-[24px] top-[718px] w-[345px]"
        />
        <p className="absolute left-[24px] top-[786px] w-[345px] text-center text-caption-12 text-text-tertiary">
          잘못된 초대 링크면 일반 첫 화면으로 이동해요
        </p>
      </Bottom>
    </Screen>
  );
}
