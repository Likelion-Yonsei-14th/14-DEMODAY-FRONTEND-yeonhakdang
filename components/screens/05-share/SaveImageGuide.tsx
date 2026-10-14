"use client";

import Image from "next/image";

import { Bottom, Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { ShareCardMajor } from "@/components/share/ShareCardMajor";
import { Button } from "@/components/ui/Button";
import { HintText } from "@/components/ui/HintText";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { useProto } from "@/lib/proto";

/**
 * Figma: 5-3 이미지 저장 · 인앱 브라우저 길게 눌러 저장 (S-03) (28:1209)
 * A full-bleed dark viewer, so the status bar switches to its Light theme.
 */
export function SaveImageGuide() {
  const proto = useProto();
  const save = () => proto.toast("이미지를 앨범에 저장했어요");
  return (
    <Screen className="bg-text-primary">
      <Tap
        label="닫기"
        onPress={proto.back}
        className="absolute left-[335px] top-[56px] p-[10px]"
      >
        <Icon name="icon-close-light" />
      </Tap>

      {/* Stands in for the long-press save of the in-app browser. */}
      <Tap onPress={save} className="absolute left-[48.9px] top-[104px]">
        <ShareCardMajor scale={0.82} />
      </Tap>

      {/* Mascot/학과 컨셉 · 와이드 over the card (79:52) */}
      <div className="pointer-events-none absolute left-[67px] top-[303px] h-[185px] w-[259px] overflow-clip rounded-[15px]">
        <Image
          src="/assets/major-wide.png"
          alt=""
          fill
          sizes="259px"
          className="pointer-events-none object-cover"
        />
      </div>

      {/* guide (28:1259) — Pattern/Guide/Hint Text (73:2891) */}
      <Bottom from={646}>
        <div className="absolute left-[44.5px] top-[646px] flex items-center gap-[10px] overflow-clip rounded-full bg-surface-default py-[8px] pl-[8px] pr-[18px]">
          <MascotFaceBadge size={40} className="border-2" />
          <HintText
            title="이미지를 길게 눌러 저장해 주세요"
            caption="인앱 브라우저에선 다운로드 버튼이 막힐 수 있어요"
            captionTone="secondary"
          />
        </div>

        <Button
          label="외부 브라우저로 열기"
          onPress={() => proto.toast("Safari에서 열었어요 · 이제 저장 버튼을 쓸 수 있어요")}
          type="outline"
          size="M"
          className="absolute left-[86.5px] top-[722px] w-[220px]"
        />
      </Bottom>
    </Screen>
  );
}
