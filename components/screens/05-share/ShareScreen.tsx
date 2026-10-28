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
import { displayName, inviteUrl, isInAppBrowser, useProto } from "@/lib/proto";

import { copyText, downloadImage, prepareKakao, sendKakaoInvite } from "@/lib/sharing";

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
  onDone: (url: string | null, filename: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const filename = `yeonhakdang-${card}-${ratio === "카톡 1:1" ? "1x1" : "9x16"}.png`;
    (async () => {
      try {
        const node = ref.current;
        if (!node) return;
        await Promise.all(
          Array.from(node.querySelectorAll("img")).map((img) => img.decode()),
        );
        await document.fonts.ready;
        const url = await toPng(node, { pixelRatio: 3, backgroundColor: "#ffffff" });
        if (cancelled) return;
        onDone(url, filename);
      } catch {
        if (!cancelled) onDone(null, filename);
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
  const [image, setImage] = useState<{ url: string; filename: string } | null>(null);
  const [manualLink, setManualLink] = useState("");
  const [kakaoReady, setKakaoReady] = useState(false);
  const [kakaoError, setKakaoError] = useState("");
  const actionLock = useRef(false);
  const exportMode = useRef<"save" | "story">("save");

  useEffect(() => {
    let active = true;
    prepareKakao().then(() => { if (active) setKakaoReady(true); })
      .catch((error: Error) => { if (active) setKakaoError(error.message); });
    return () => { active = false; };
  }, []);

  const onExported = useCallback((url: string | null, filename: string) => {
    actionLock.current = false;
    setExporting(false);
    if (!url) { toast("이미지를 만들지 못했어요. 네트워크를 확인하고 다시 시도해 주세요."); return; }
    setImage({ url, filename });
    if (!isInAppBrowser() && exportMode.current === "save") {
      downloadImage(url, filename);
      toast("이미지 다운로드를 요청했어요");
    }
  }, [toast]);

  const onAction = async (kind: ShareActionKind) => {
    if (actionLock.current) return;
    if (kind === "이미지 저장" || kind === "인스타 스토리") {
      actionLock.current = true;
      exportMode.current = kind === "인스타 스토리" ? "story" : "save";
      if (exportMode.current === "story") setRatio("스토리 9:16");
      setExporting(true);
      return;
    }
    actionLock.current = true;
    try {
      const url = inviteUrl(displayName(proto.state));
      if (kind === "카카오톡 공유") {
        if (!kakaoReady) {
          toast(kakaoError || "카카오톡 공유를 준비 중이에요. 잠시 후 다시 눌러 주세요.");
          await prepareKakao();
          setKakaoReady(true);
          setKakaoError("");
          toast("준비됐어요. 카카오톡 공유를 다시 눌러 주세요.");
          return;
        }
        // No await before this call: preserve the click's popup permission.
        await sendKakaoInvite(displayName(proto.state), url);
      } else {
        try { await copyText(url); toast("초대 링크를 복사했어요"); }
        catch { setManualLink(url); }
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "공유를 열지 못했어요. 팝업 허용 후 다시 시도해 주세요.");
    } finally { actionLock.current = false; }
  };

  const shareImage = async () => {
    if (!image || actionLock.current) return;
    actionLock.current = true;
    try {
      // Decode locally without fetching so share() remains in the click gesture.
      const bytes = Uint8Array.from(atob(image.url.split(",")[1]), (c) => c.charCodeAt(0));
      const file = new File([bytes], image.filename, { type: "image/png" });
      if (!navigator.canShare?.({ files: [file] })) {
        toast("이미지를 저장한 뒤 인스타그램에서 스토리로 올려 주세요.");
        return;
      }
      await navigator.share({ files: [file] });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) toast("이미지 공유를 열지 못했어요. 다운로드를 이용해 주세요.");
    } finally { actionLock.current = false; }
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
        <ShareActions disabled={exporting} onAction={onAction} className="absolute left-[24px] top-[712px] w-[345px]" />
      </Bottom>

      {staticToast && !proto.active && (
        <Toast className="absolute left-[97px] top-[580px]" text={staticToast} />
      )}

      {exporting && <p role="status" className="absolute left-[24px] top-[610px]">이미지를 만드는 중이에요…</p>}
      {(image || manualLink) && (
        <div role="dialog" aria-modal="true" aria-label={image ? "이미지 저장 및 공유" : "초대 링크 복사"}
          onKeyDown={(event) => {
            if (event.key === "Escape") { setImage(null); setManualLink(""); }
            if (event.key === "Tab") {
              const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, input"));
              const first = controls[0], last = controls[controls.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }
          }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white p-6">
          <button autoFocus type="button" onClick={() => { setImage(null); setManualLink(""); }} className="self-end rounded border px-4 py-2">닫기</button>
          {image ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="저장할 연학당 결과 카드" className="max-h-[65%] max-w-full object-contain" />
            <p className="text-center text-sm">이미지를 길게 눌러 저장할 수 있어요.<br />스토리는 이미지 저장 후 인스타그램에서 올려 주세요.</p>
            <div className="flex gap-3">
              <button type="button" className="rounded border px-4 py-2" onClick={() => downloadImage(image.url, image.filename)}>PNG 다운로드</button>
              <button type="button" className="rounded border px-4 py-2" onClick={shareImage}>이미지 공유</button>
            </div>
          </> : <>
            <p>링크를 선택해 직접 복사해 주세요.</p>
            <input aria-label="초대 링크" readOnly value={manualLink} onFocus={(event) => event.target.select()} className="w-full rounded border p-3" />
          </>}
        </div>
      )}
      {exporting && <CardExporter card={card} ratio={ratio} onDone={onExported} />}
    </Screen>
  );
}
