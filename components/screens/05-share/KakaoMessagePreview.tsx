"use client";

import { HomeIndicator } from "@/components/chrome/HomeIndicator";
import { StatusBar } from "@/components/chrome/StatusBar";
import { Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { ShareCardMajorSquare } from "@/components/share/ShareCardMajorSquare";
import { InfoBox } from "@/components/ui/InfoBox";
import { Tap } from "@/components/ui/Tap";
import { INITIAL_STATE, displayName, useProto } from "@/lib/proto";

/** Figma: 5-4 카카오톡 공유 메시지 미리보기 (S-04 · S-07) (28:1272) */
export function KakaoMessagePreview() {
  const proto = useProto();
  const name = displayName(proto.state);
  return (
    <Screen className="bg-bg-subtle">
      <StatusBar className="absolute left-0 top-0" />

      <p className="absolute left-[24px] top-[74px] whitespace-nowrap text-[12px] font-bold leading-[18px] text-text-tertiary">
        카카오톡 채팅방에 전송되는 형태
      </p>

      {/* kakao feed message (28:1285) */}
      <Tap
        onPress={() => proto.reset("1-2", { ...INITIAL_STATE, invited: true })}
        className="absolute left-[24px] top-[110px] flex flex-col items-start overflow-clip rounded-[14px] bg-surface-default shadow-card"
      >
        <ShareCardMajorSquare scale={260 / 360} />
        <div className="relative flex shrink-0 flex-col items-start gap-[4px] overflow-clip px-[16px] py-[14px]">
          <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
            {name}님이 동기 명단에 초대했어요
          </p>
          <p className="relative w-[228px] shrink-0 text-caption-12 text-text-secondary">
            내 동기 수석 합격자는 누구? 너도 합격 확인해봐
          </p>
        </div>
        <div className="relative flex w-[260px] shrink-0 items-start justify-center overflow-clip border-t border-line-default py-[12px]">
          <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14 text-brand-secondary">
            나도 내 학과 찾기
          </p>
        </div>
      </Tap>

      {/* sender row (28:1307) */}
      <div className="absolute left-[24px] top-[523px] flex items-center gap-[8px] overflow-clip">
        <MascotFaceBadge size={40} className="border-2" />
        <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-secondary">
          {name}
        </p>
      </div>

      <InfoBox className="absolute left-[24px] top-[700px] w-[345px]">
        링크 미리보기(OG)는 초대자 이름·1위 학과로 동적으로 만들어져요. 링크를 누르면
        1-2 초대 랜딩으로 이동해요.
      </InfoBox>

      <HomeIndicator className="absolute left-0 top-[818px]" />
    </Screen>
  );
}
