"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { BottomSheetHeader, Dim } from "@/components/layout/BottomSheet";
import { Bottom, Overlay, Screen } from "@/components/layout/Screen";
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
import { Button } from "@/components/ui/Button";
import { HintText } from "@/components/ui/HintText";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toast } from "@/components/ui/Toast";
import { trackShareClick, type ShareMethod } from "@/lib/analytics";
import { renderCard } from "@/lib/cardImage";
import { ilganArt } from "@/lib/ilganArt";
import { displayName, inviteUrl, isInAppBrowser, useProto } from "@/lib/proto";
import { useAnalysis } from "@/lib/useAnalysis";
import {
  copyText,
  downloadImage,
  imageFile,
  kakaoConfigured,
  prepareKakao,
  sendKakaoInvite,
  shareImageFile,
  shareLink,
  usesMobileStoryShare,
} from "@/lib/sharing";

type CardKind = "major" | "roster";
type ImageAction = "이미지 저장" | "인스타 스토리";
type Png = { url: string; filename: string };

const SHARE_MESSAGE = "내 동기 수석 합격자는 누구? 너도 합격 확인해봐";
const cardKey = (card: CardKind, ratio: ShareRatio) => `${card}|${ratio}`;
/** The share_click `method` sent to GA. */
const SHARE_METHODS: Record<ShareActionKind, ShareMethod> = {
  "카카오톡 공유": "kakao",
  "이미지 저장": "image",
  "링크 복사": "link",
  "인스타 스토리": "instagram_story",
};

/**
 * The card exactly as it is saved: native 360-wide size, 학과 컨셉 image laid
 * over the 9:16 card where the preview shows it (79:52, 189×135 at 0.6×).
 */
function ExportCard({ card, ratio }: { card: CardKind; ratio: ShareRatio }) {
  const art = ilganArt(useAnalysis().dayMaster.name);
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
        <img src={art.card} alt="" className="size-full object-cover" />
      </div>
    </div>
  );
}

/** Renders the card off-screen and turns it into a 3× PNG (1080 wide). */
function CardExporter({
  card,
  ratio,
  onDone,
}: {
  card: CardKind;
  ratio: ShareRatio;
  onDone: (key: string, png: Png | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    let settled = false;
    const key = cardKey(card, ratio);
    const filename = `yeonhakdang-${card}-${ratio === "카톡 1:1" ? "1x1" : "9x16"}.png`;
    const finish = (png: Png | null) => {
      if (cancelled || settled) return;
      settled = true;
      clearTimeout(timer);
      onDone(key, png);
    };
    const timer = setTimeout(() => finish(null), 20000);
    (async () => {
      try {
        const node = ref.current;
        if (!node) throw new Error("no card");
        const url = await renderCard(node);
        finish({ url, filename });
      } catch {
        finish(null);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
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
  const art = ilganArt(useAnalysis().dayMaster.name);
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
          src={art.card}
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

type Sheet =
  /** In-app browsers block downloads: long-press the image instead. */
  | { mode: "save"; png: Png }
  /** The image is ready but the click that asked for it has passed: share from a new tap. */
  | { mode: "story"; png: Png | null; failed?: boolean }
  /** The clipboard is blocked: select the link by hand. */
  | { mode: "link"; url: string };

/** What appears after an action needs the visitor once more. */
function ShareSheet({ sheet, desktop, onRetry, onShare, onSave, onClose }: { sheet: Sheet; desktop: boolean; onRetry: () => void; onShare: (png: Png) => void; onSave: (png: Png) => void; onClose: () => void }) {
  const title = sheet.mode === "link" ? "링크 복사" : sheet.mode === "save" ? "이미지 저장" : "인스타 스토리";
  return (
    <Overlay>
      <Dim onPress={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(event) => event.key === "Escape" && onClose()}
        className="proto-sheet-in screen-scroll absolute bottom-0 left-0 flex max-h-[90%] w-full flex-col items-center rounded-t-[24px] bg-surface-default pb-[34px] shadow-sheet"
      >
        <BottomSheetHeader title={title} onClose={onClose} />
        {sheet.mode === "link" ? (
          <div className="flex w-full flex-col gap-[12px] px-[24px] pt-[4px]">
            <HintText title="링크를 길게 눌러 복사해 주세요" caption="이 브라우저에서는 자동 복사가 막혀 있어요" />
            <input
              aria-label="초대 링크"
              readOnly
              autoFocus
              value={sheet.url}
              onFocus={(event) => event.target.select()}
              className="w-full rounded-[12px] border border-line-default bg-bg-subtle p-[12px] text-body-m-14"
            />
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-[16px] px-[24px] pt-[4px]">
            {sheet.png && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sheet.png.url} alt="연학당 공유 카드" className="max-h-[240px] max-w-full shrink-0 rounded-[12px] object-contain shadow-sheet" />
            )}
            {sheet.mode === "save" ? (
              <HintText title="이미지를 길게 눌러 저장해 주세요" caption="인앱 브라우저에선 다운로드 버튼이 막힐 수 있어요" />
            ) : !sheet.png ? (
              sheet.failed ? (
                <>
                  <HintText title="이미지를 만들지 못했어요" caption="네트워크를 확인하고 다시 시도해 주세요." />
                  <Button label="이미지 다시 만들기" size="M" onPress={onRetry} />
                </>
              ) : (
                <div role="status" className="flex flex-col items-center gap-3 py-6 text-body-m-14">
                  <div className="proto-spinner size-6 rounded-full border-[3px] border-line-default border-t-text-secondary" />
                  스토리 이미지를 만들고 있어요…
                </div>
              )
            ) : (
              <>
                <HintText title="스토리용 이미지가 준비됐어요" caption={desktop ? "PC에서는 스토리 이미지를 다운로드한 뒤 휴대폰으로 옮겨 인스타그램 앱에서 올려 주세요." : "공유 목록에 Instagram이 보이면 선택해 주세요. 인스타 앱으로 바로 이동하는 기능은 아니에요."} />
                {!desktop && <Button label="휴대폰 공유 목록 열기" size="M" onPress={() => onShare(sheet.png!)} className="w-full" />}
                <Button label={desktop ? "스토리 이미지 다운로드" : "이미지 저장하고 직접 올리기"} type={desktop ? "primary" : "outline"} size="M" onPress={() => onSave(sheet.png!)} className="w-full" />
                <p className="text-caption-12 text-text-secondary">인스타그램 앱 → 스토리 만들기 → 저장한 사진을 선택해 주세요.{!desktop && " 인앱 브라우저에서는 위 이미지를 길게 눌러 저장할 수 있어요."}</p>
              </>
            )}
          </div>
        )}
      </div>
    </Overlay>
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
  const mobileStoryShare = typeof navigator !== "undefined" && usesMobileStoryShare(navigator.userAgent, navigator.maxTouchPoints);
  const kakaoImage = ilganArt(useAnalysis().dayMaster.name).card;
  const { toast } = proto;
  const [card, setCard] = useState(initialCard);
  const [ratio, setRatio] = useState(initialRatio);

  // Each card · ratio is rendered once, in the background as soon as it is
  // on screen, so 이미지 저장 / 인스타 스토리 usually find it ready.
  const [pngs, setPngs] = useState<Record<string, Png | null>>({});
  const key = cardKey(card, ratio);
  const rendering = proto.active && !(key in pngs);
  const storyKey = cardKey(card, "스토리 9:16");
  const preparingStory = proto.active && key !== storyKey && !(storyKey in pngs);
  /** An image action waiting for its card to finish rendering. */
  const [waiting, setWaiting] = useState<{ kind: ImageAction; key: string } | null>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [kakaoError, setKakaoError] = useState("");
  const linkLock = useRef(false);
  const storyLock = useRef(false);

  useEffect(() => {
    if (!kakaoConfigured) return;
    let active = true;
    prepareKakao().then(() => { if (active) setKakaoReady(true); })
      .catch((error: Error) => { if (active) setKakaoError(error.message); });
    return () => { active = false; };
  }, []);

  const saveImage = useCallback((png: Png) => {
    if (isInAppBrowser()) return setSheet({ mode: "save", png });
    downloadImage(png.url, png.filename);
    toast("이미지를 저장했어요");
  }, [toast]);

  /** Opens the share sheet with the image; must run inside the tap that asked. */
  const shareStory = useCallback(async (png: Png) => {
    if (storyLock.current) return;
    storyLock.current = true;
    try {
      const result = await shareImageFile(imageFile(png.url, png.filename));
      if (result === "shared") return setSheet(null);
      if (result === "cancelled") return;
      setSheet({ mode: "story", png });
      toast("이 브라우저는 이미지 공유를 지원하지 않아요. 아래 저장 버튼으로 이미지를 저장해 주세요.");
    } catch {
      setSheet({ mode: "story", png });
      toast("공유 목록을 열지 못했어요. 이미지 저장 후 인스타그램에서 직접 올려 주세요.");
    } finally {
      storyLock.current = false;
    }
  }, [toast]);

  // The ref decides (callbacks read it); the state only drives the spinner.
  const waitingRef = useRef<{ kind: ImageAction; key: string } | null>(null);
  const wait = (next: { kind: ImageAction; key: string } | null) => {
    waitingRef.current = next;
    setWaiting(next);
  };

  const onRendered = useCallback((done: string, png: Png | null) => {
    setPngs((all) => ({ ...all, [done]: png }));
    const w = waitingRef.current;
    if (!w || w.key !== done) return;
    waitingRef.current = null;
    setWaiting(null);
    if (!png) {
      if (w.kind === "인스타 스토리" && !mobileStoryShare) setSheet({ mode: "story", png: null, failed: true });
      return toast("이미지를 만들지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.");
    }
    // The tap is long gone: saving still works, sharing needs a fresh tap.
    if (w.kind === "이미지 저장") saveImage(png);
    else if (!mobileStoryShare) setSheet({ mode: "story", png });
    else toast("스토리 이미지가 준비됐어요. 인스타 스토리 버튼을 다시 눌러 공유해 주세요.");
  }, [toast, saveImage, mobileStoryShare]);

  const imageAction = (kind: ImageAction) => {
    const desktopStory = kind === "인스타 스토리" && !mobileStoryShare;
    if (waitingRef.current && !desktopStory) return toast("공유 이미지를 준비 중이에요. 잠시만 기다려 주세요.");
    const ratioFor = kind === "인스타 스토리" ? "스토리 9:16" : ratio;
    const target = cardKey(card, ratioFor);
    if (ratioFor !== ratio) setRatio(ratioFor);
    const png = pngs[target];
    if (desktopStory) setSheet({ mode: "story", png: png ?? null });
    if (png) {
      if (kind === "이미지 저장") return saveImage(png);
      if (mobileStoryShare) return void shareStory(png);
      wait(null);
      return;
    }
    // Not rendered yet, or it failed last time: (re)render and finish when it lands.
    if (png === null) setPngs((all) => Object.fromEntries(Object.entries(all).filter(([k]) => k !== target)));
    wait({ kind, key: target });
    toast("공유 이미지를 만들고 있어요. 잠시만 기다려 주세요.");
  };

  /** Switching card or ratio abandons an image action still waiting for the old one. */
  const choose = (next: { card?: CardKind; ratio?: ShareRatio }) => {
    wait(null);
    if (next.card) setCard(next.card);
    if (next.ratio) setRatio(next.ratio);
  };

  const linkAction = async (kind: "카카오톡 공유" | "링크 복사") => {
    if (linkLock.current) return;
    linkLock.current = true;
    try {
      const url = inviteUrl(proto.state);
      if (kind === "카카오톡 공유" && kakaoConfigured) {
        if (!kakaoReady) {
          toast(kakaoError || "카카오톡 공유를 준비 중이에요. 잠시 후 다시 눌러 주세요.");
          await prepareKakao();
          setKakaoReady(true);
          setKakaoError("");
          toast("준비됐어요. 카카오톡 공유를 다시 눌러 주세요.");
          return;
        }
        // No await before this call: preserve the click's popup permission.
        await sendKakaoInvite(displayName(proto.state), url, kakaoImage);
        return;
      }
      if (kind === "카카오톡 공유") {
        // No Kakao key: the phone's share sheet, where 카카오톡 is one of the targets.
        const shared = await shareLink(url, SHARE_MESSAGE);
        if (shared !== "unsupported") return;
      }
      try {
        await copyText(url);
        toast(kind === "카카오톡 공유" ? "링크를 복사했어요. 카카오톡 대화방에 붙여넣어 보내 주세요" : "초대 링크를 복사했어요");
      } catch {
        setSheet({ mode: "link", url });
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "공유를 열지 못했어요. 팝업 허용 후 다시 시도해 주세요.");
    } finally {
      linkLock.current = false;
    }
  };

  const onAction = (kind: ShareActionKind) => {
    trackShareClick(SHARE_METHODS[kind]);
    return kind === "이미지 저장" || kind === "인스타 스토리" ? imageAction(kind) : void linkAction(kind);
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
        onChange={(i) => choose({ card: i === 0 ? "major" : "roster" })}
        className="absolute left-[24px] top-[112px] w-[345px]"
      />
      <ShareRatioToggle
        selected={ratio}
        onChange={(r) => choose({ ratio: r })}
        className="absolute left-[119.5px] top-[172px]"
      />

      {/* preview bg (28:1050 · 28:1148) */}
      <div className="absolute left-[24px] top-[214px] h-[412px] w-[345px] rounded-[20px] bg-bg-subtle" />
      <Preview card={card} ratio={ratio} />

      <Bottom from={640}>
        <ShareMessageBox
          className="absolute left-[24px] top-[640px] w-[345px]"
          message={SHARE_MESSAGE}
        />
        <ShareActions busy={waiting?.kind} onAction={onAction} className="absolute left-[24px] top-[712px] w-[345px]" />
      </Bottom>

      {staticToast && !proto.active && (
        <Toast className="absolute left-[97px] top-[580px]" text={staticToast} />
      )}

      {sheet && <ShareSheet sheet={sheet} desktop={!mobileStoryShare} onRetry={() => imageAction("인스타 스토리")} onShare={(png) => void shareStory(png)} onSave={(png) => {
        if (isInAppBrowser()) return toast("위 이미지를 길게 눌러 사진으로 저장해 주세요.");
        downloadImage(png.url, png.filename);
        toast("이미지 저장을 요청했어요. 저장한 사진을 인스타 스토리에 추가해 주세요.");
      }} onClose={() => { wait(null); setSheet(null); }} />}
      {rendering && <CardExporter key={key} card={card} ratio={ratio} onDone={onRendered} />}
      {preparingStory && <CardExporter key={storyKey} card={card} ratio="스토리 9:16" onDone={onRendered} />}
    </Screen>
  );
}
