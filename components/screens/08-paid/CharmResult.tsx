"use client";

import Image from "next/image";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { MascotTipSmall } from "@/components/result/ResultSections";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { displayName, useProto } from "@/lib/proto";
import { useOpenRecord } from "@/lib/useOpenRecord";

/** Each 다시 뽑기 swaps in the next design; the result art comes first. */
const CHARMS = [
  "/assets/charm-result.png",
  "/assets/charm-poster-1.png",
  "/assets/charm-poster-3.png",
  "/assets/charm-poster-2.png",
];

/** Figma: 8-3 부적 · 결과 (PR-01·02) (33:1762) — a 1136px-tall frame. */
export function CharmResult() {
  const proto = useProto();
  useOpenRecord("charm");
  const { charmRerolls } = proto.state;
  const charm = proto.active ? CHARMS[(3 - charmRerolls) % CHARMS.length] : CHARMS[0];

  return (
    <Screen height={1136}>
      <TopBar title="합격 부적" />

      {/* content (33:1782) */}
      <div className="flex w-[393px] flex-col items-center gap-[24px] overflow-clip px-[24px] pb-[120px] pt-[8px]">
        <div className="relative flex shrink-0 flex-col items-center gap-[6px] overflow-clip whitespace-nowrap font-bold">
          <p className="relative shrink-0 text-overline-12 text-brand-secondary">
            {displayName(proto.state)}님의 합격 부적
          </p>
          <p className="relative shrink-0 font-serif text-h2-22">
            금(金)을 채워 결단을 돕는 부적
          </p>
        </div>

        <div className="relative h-[336px] w-[155px] shrink-0 rounded-[10px] border border-[#5b606b]">
          <Image
            key={charm}
            src={charm}
            alt=""
            fill
            sizes="155px"
            className="proto-fade-in pointer-events-none rounded-[10px] object-cover"
          />
        </div>

        {/* 의미 (73:2486) */}
        <div className="relative flex shrink-0 flex-wrap content-start items-start gap-[6px] overflow-clip">
          <Chip label="#금 기운 보충" />
          <Chip label="#결단력" />
          <Chip label="#집중" />
        </div>

        <p className="relative w-[345px] shrink-0 text-body-m-14 text-text-secondary">
          목(木)이 강한 사주에 부족한 금(金)의 흰·금빛과 원형 문양을 담았어요. 시험
          전날 잠금화면으로 설정해 두세요.
        </p>

        {/* actions (33:1807) */}
        <div className="relative flex shrink-0 flex-col items-start gap-[10px] overflow-clip">
          <Button
            label="고화질로 저장하기"
            onPress={() => proto.toast("고화질 부적을 앨범에 저장했어요")}
            className="w-[345px]"
          />
          <Button
            label="다시 뽑기"
            type="outline"
            disabled={charmRerolls === 0}
            onPress={() => {
              proto.update({ charmRerolls: charmRerolls - 1 });
              proto.toast("연학이가 새 부적을 그렸어요");
            }}
            className="w-[345px]"
          />
          <div className="relative flex w-[345px] shrink-0 items-center justify-center gap-[6px] overflow-clip">
            <Icon name="icon-refresh-14" size={14} />
            <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-tertiary">
              다시 뽑기 남은 횟수
            </p>
            <p className="relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px] text-brand-primary">
              {charmRerolls} / 3
            </p>
          </div>
        </div>

        <MascotTipSmall>
          {"인앱 브라우저면 이미지를\n길게 눌러 저장해 줘!"}
        </MascotTipSmall>
      </div>

      <BottomNav active="charm" className="absolute left-0 top-[1046px]" />
    </Screen>
  );
}
