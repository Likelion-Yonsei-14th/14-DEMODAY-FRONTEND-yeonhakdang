"use client";

import { useEffect, useRef, useState } from "react";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { BottomSheetHeader, Dim } from "@/components/layout/BottomSheet";
import { Overlay, Screen } from "@/components/layout/Screen";
import { CHARM_HEIGHT, CHARM_WIDTH, CharmArt } from "@/components/paid/CharmArt";
import { MascotTipSmall } from "@/components/result/ResultSections";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { HintText } from "@/components/ui/HintText";
import { Icon } from "@/components/ui/Icon";
import { renderCard } from "@/lib/cardImage";
import { displayName, isInAppBrowser, useProto } from "@/lib/proto";
import { downloadImage } from "@/lib/sharing";
import { useOpenRecord } from "@/lib/useOpenRecord";
import { useCharmResult } from "@/lib/usePaid";

/** The 155×336 preview of the 393×852 art. */
const PREVIEW_SCALE = 155 / CHARM_WIDTH;

/** In-app browsers block downloads: the PNG to long-press instead. */
function SaveSheet({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <Overlay>
      <Dim onPress={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="부적 저장"
        onKeyDown={(event) => event.key === "Escape" && onClose()}
        className="proto-sheet-in absolute bottom-0 left-0 flex w-full flex-col items-center rounded-t-[24px] bg-surface-default pb-[34px] shadow-sheet"
      >
        <BottomSheetHeader title="부적 저장" onClose={onClose} />
        <div className="flex w-full flex-col items-center gap-[16px] px-[24px] pt-[4px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="합격 부적" className="max-h-[420px] max-w-full rounded-[12px] object-contain shadow-sheet" />
          <HintText title="이미지를 길게 눌러 저장해 주세요" caption="인앱 브라우저에선 다운로드 버튼이 막힐 수 있어요" />
        </div>
      </div>
    </Overlay>
  );
}

/** Figma: 8-3 부적 · 결과 (PR-01·02) (33:1762) — a 1136px-tall frame. */
export function CharmResult() {
  const proto = useProto();
  useOpenRecord("charm");
  const { charmRerolls } = proto.state;
  const charm = useCharmResult();
  const exportRef = useRef<HTMLDivElement>(null);
  /** The high-res PNG of the art on screen, made in the background. */
  const [png, setPng] = useState<{ key: string; url: string } | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const artKey = JSON.stringify(charm.art);
  const ready = png?.key === artKey ? png.url : null;

  const { active } = proto;
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const node = exportRef.current;
    if (!node) return;
    renderCard(node)
      .then((url) => !cancelled && setPng({ key: artKey, url }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active, artKey]);

  const save = () => {
    if (!ready) return;
    if (isInAppBrowser()) return setSheetUrl(ready);
    downloadImage(ready, `yeonhakdang-charm-${charm.art.word}.png`);
    proto.toast("고화질 부적을 저장했어요");
  };

  return (
    <Screen height={1136}>
      <TopBar title="합격 부적" />

      {/* content (33:1782) */}
      <div className="flex w-[393px] flex-col items-center gap-[24px] overflow-clip px-[24px] pb-[120px] pt-[8px]">
        <div className="relative flex shrink-0 flex-col items-center gap-[6px] overflow-clip whitespace-nowrap font-bold">
          <p className="relative shrink-0 text-overline-12 text-brand-secondary">
            {displayName(proto.state)}님의 합격 부적
          </p>
          <p className="relative shrink-0 font-serif text-h2-22">{charm.title}</p>
        </div>

        <div className="relative h-[336px] w-[155px] shrink-0 overflow-hidden rounded-[10px] border border-[#5b606b]">
          <CharmArt
            key={artKey}
            art={charm.art}
            className="proto-fade-in pointer-events-none absolute left-0 top-0 origin-top-left"
            style={{ transform: `scale(${PREVIEW_SCALE})` }}
          />
        </div>

        {/* 의미 (73:2486) */}
        <div className="relative flex shrink-0 flex-wrap content-start items-start gap-[6px] overflow-clip">
          {charm.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </div>

        <p className="relative w-[345px] shrink-0 text-body-m-14 text-text-secondary">
          {charm.description}
        </p>

        {/* actions (33:1807) */}
        <div className="relative flex shrink-0 flex-col items-start gap-[10px] overflow-clip">
          <Button
            label={ready || !active ? "고화질로 저장하기" : "고화질 부적을 그리는 중…"}
            disabled={active && !ready}
            onPress={save}
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

      {/* Off-screen full-size copy: the source of the saved PNG (3× → 1179×2556). */}
      {active && (
        <div className="pointer-events-none absolute left-[-2000px] top-0" aria-hidden>
          <div ref={exportRef} style={{ width: CHARM_WIDTH, height: CHARM_HEIGHT }}>
            <CharmArt art={charm.art} />
          </div>
        </div>
      )}

      {sheetUrl && <SaveSheet url={sheetUrl} onClose={() => setSheetUrl(null)} />}
    </Screen>
  );
}
