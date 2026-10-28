"use client";

import { toPng } from "html-to-image";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import {
  ShareActions,
  ShareMessageBox,
  ShareRatioToggle,
  type ShareActionKind,
  type ShareRatio,
} from "@/components/share/ShareActions";
import { ShareCardMajor } from "@/components/share/ShareCardMajor";
import { ShareCardMajorSquare } from "@/components/share/ShareCardMajorSquare";
import { ShareCardRoster } from "@/components/share/ShareCardRoster";
import { ShareCardRosterTall } from "@/components/share/ShareCardRosterTall";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toast } from "@/components/ui/Toast";
import { inviteUrl, isInAppBrowser, useProto } from "@/lib/proto";

type CardKind = "major" | "roster";

/**
 * The card exactly as it is saved: native 360-wide size, 학과 컨셉 image laid
 * over the 9:16 card where the preview shows it (79:52, 189×135 at 0.6×).
 */
function ExportCard({ card, ratio }: { card: CardKind; ratio: ShareRatio }) {
  if (ratio === "카톡 1:1") {
    return card === "major" ? <ShareCardMajorSquare /> : <ShareCardRoster />;
  }
  if (card === "roster") return <ShareCardRosterTall />;
  return (
    <div className="relative">
      <ShareCardMajor />
      <div className="absolute left-[22.5px] top-[248px] h-[225px] w-[315px] overflow-clip rounded-[25px]">
        {/* A plain <img> so the exporter can inline it without a srcset. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/major-wide.png" alt="" className="size-full object-cover" />
      </div>
    </div>
  );
}

/** Renders the card off-screen, saves it at 3× (1080 wide), then reports back. */
function CardExporter({
  card,
  ratio,
  onDone,
}: {
  card: CardKind;
  ratio: ShareRatio;
  onDone: (ok: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const node = ref.current;
        if (!node) return;
        await Promise.all(
          Array.from(node.querySelectorAll("img")).map((img) => img.decode().catch(() => {})),
        );
        const url = await toPng(node, { pixelRatio: 3 });
        if (cancelled) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = `yeonhakdang-${card}-${ratio === "카톡 1:1" ? "1x1" : "9x16"}.png`;
        a.click();
        onDone(true);
      } catch {
        if (!cancelled) onDone(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [card, ratio, onDone]);
  return (
    <div className="pointer-events-none absolute left-[-2000px] top-0">
      <div ref={ref} className="w-fit">
        <ExportCard card={card} ratio={ratio} />
      </div>
    </div>
  );
}

/** 9:16 cards sit at 0.6× (28:1050), 1:1 cards at 0.86× (28:1148). */
function Preview({ card, ratio }: { card: CardKind; ratio: ShareRatio }) {
  if (ratio === "카톡 1:1") {
    const Card = card === "major" ? ShareCardMajorSquare : ShareCardRoster;
    return <Card scale={0.86} className="absolute left-[41.7px] top-[266px]" />;
  }
  if (card === "roster") {
    return (
      <ShareCardRosterTall scale={0.6} className="absolute left-[88.5px] top-[226px]" />
    );
  }
  return (
    <>
      <ShareCardMajor scale={0.6} className="absolute left-[88.5px] top-[226px]" />
      {/* Mascot/학과 컨셉 · 와이드 overlaid on the preview (79:52) */}
      <div className="absolute left-[102px] top-[375px] h-[135px] w-[189px] overflow-clip rounded-[15px]">
        <Image
          src="/assets/major-wide.png"
          alt=""
          fill
          sizes="189px"
          className="pointer-events-none object-cover"
        />
      </div>
      <MascotFaceBadge size={64} className="absolute left-[290px] top-[540px] border-[3px]" />
    </>
  );
}

/**
 * The 5-1 / 5-2 공유하기 screen: 5-1 is the 학과 카드 at 9:16, 5-2 the 명단
 * 카드 at 1:1 right after 링크 복사. In the prototype both toggles are live.
 */
export function ShareScreen({
  initialCard,
  initialRatio,
  staticToast,
}: {
  initialCard: CardKind;
  initialRatio: ShareRatio;
  /** The toast baked into the 5-2 frame. */
  staticToast?: string;
}) {
  const proto = useProto();
  const [card, setCard] = useState(initialCard);
  const [ratio, setRatio] = useState(initialRatio);
  const [exporting, setExporting] = useState(false);

  const { toast } = proto;
  const onExported = useCallback(
    (ok: boolean) => {
      setExporting(false);
      toast(ok ? "이미지를 저장했어요" : "이미지를 만들지 못했어요");
    },
    [toast],
  );

  const onAction = (kind: ShareActionKind) => {
    if (kind === "이미지 저장") {
      // In-app browsers block downloads: 5-3 explains the long-press save.
      if (isInAppBrowser()) return proto.go("5-3");
      return setExporting(true);
    }
    if (kind === "카카오톡") return proto.go("5-4");
    if (kind === "인스타 스토리") {
      setRatio("스토리 9:16");
      return proto.toast("인스타그램 스토리로 보냈어요");
    }
    navigator.clipboard
      ?.writeText(inviteUrl(proto.state))
      .then(() => proto.toast("초대 링크를 복사했어요"))
      .catch(() => proto.toast("링크를 복사하지 못했어요"));
  };

  return (
    <Screen>
      {/* The frame's close bar has no glyph; the prototype adds one to leave. */}
      <TopBar
        type="close"
        title="공유하기"
        right={proto.active ? "icon-close" : undefined}
        className="absolute left-0 top-[54px]"
      />

      <SegmentedControl
        options={["학과 결과 카드", "합격자 명단 카드"]}
        selected={card === "major" ? 0 : 1}
        onChange={(i) => setCard(i === 0 ? "major" : "roster")}
        className="absolute left-[24px] top-[112px] w-[345px]"
      />
      <ShareRatioToggle
        selected={ratio}
        onChange={setRatio}
        className="absolute left-[119.5px] top-[172px]"
      />

      {/* preview bg (28:1050 · 28:1148) */}
      <div className="absolute left-[24px] top-[214px] h-[412px] w-[345px] rounded-[20px] bg-bg-subtle" />
      <Preview card={card} ratio={ratio} />

      <Bottom from={640}>
        <ShareMessageBox
          className="absolute left-[24px] top-[640px] w-[345px]"
          message="내 동기 수석 합격자는 누구? 너도 합격 확인해봐"
        />
        <ShareActions onAction={onAction} className="absolute left-[24px] top-[712px] w-[345px]" />
      </Bottom>

      {staticToast && !proto.active && (
        <Toast className="absolute left-[97px] top-[580px]" text={staticToast} />
      )}

      {exporting && <CardExporter card={card} ratio={ratio} onDone={onExported} />}
    </Screen>
  );
}
