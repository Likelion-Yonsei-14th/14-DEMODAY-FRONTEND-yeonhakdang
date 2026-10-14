"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { HomeIndicator } from "@/components/chrome/HomeIndicator";
import { StatusBar } from "@/components/chrome/StatusBar";
import { Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { FiveElement } from "@/components/saju/FiveElement";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { LoadingStepRow } from "@/components/ui/LoadingStepRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useProto, type ProtoState } from "@/lib/proto";

/**
 * Figma: 3-1 분석 중 · 로딩 (24:403)
 * The five 오행 chips sit on a ring around 연학이 at the exact angles from the
 * frame, so their offsets are kept verbatim rather than recomputed.
 */
const ORBIT_CHIPS = [
  { element: "목", active: true, left: 170.5, top: 94 },
  { element: "화", active: true, left: 313.16, top: 197.65 },
  { element: "토", active: true, left: 258.67, top: 365.35 },
  { element: "금", active: false, left: 82.33, top: 365.35 },
  { element: "수", active: false, left: 27.84, top: 197.65 },
] as const;

/** Step i is done once progress passes STEP_ENDS[i]. */
const STEP_ENDS = [22, 48, 86, 100];
const STAGE_LABELS = ["만세력 변환 중", "오행 분포 계산 중", "학과 매칭 중", "결과 문구 정리 중"];
const DURATION_MS = 4200;

function birthCaption({ birth, calendar }: Pick<ProtoState, "birth" | "calendar">) {
  if (birth.length !== 10) return "2008년 3월 15일 · 양력";
  const [y, m, d] = birth.split(".").map(Number);
  return `${y}년 ${m}월 ${d}일 · ${calendar === 1 ? "음력" : "양력"}`;
}

export function AnalyzingLoading() {
  const proto = useProto();
  // The frame freezes at 68% — mid 학과 매칭. The prototype runs the bar.
  const [progress, setProgress] = useState(proto.active ? 0 : 68);
  // Demo "분석 지연": the bar stalls at the frame's 68%, then 3-2 takes over.
  const [slow] = useState(proto.demo.slowAnalysis);
  const target = slow ? 68 : 100;

  useEffect(() => {
    if (!proto.active) return;
    const start = performance.now();
    const timer = setInterval(() => {
      const t = Math.min((performance.now() - start) / DURATION_MS, 1);
      setProgress(Math.round((1 - (1 - t) ** 2) * target));
      if (t === 1) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [proto.active, target]);

  const { replace, toast, update, state, setDemo } = proto;
  useEffect(() => {
    if (!slow) return;
    const stalled = setTimeout(() => {
      setDemo({ slowAnalysis: false });
      replace("3-2");
    }, DURATION_MS + 1200);
    return () => clearTimeout(stalled);
  }, [slow, replace, setDemo]);

  useEffect(() => {
    if (progress < 100) return;
    const done = setTimeout(() => {
      update({ analyzed: true });
      replace("3-4");
      if (state.invited) toast("민지님과 서로의 합격자 명단에 등록됐어요");
    }, 350);
    return () => clearTimeout(done);
  }, [progress, replace, toast, update, state.invited]);

  const stage = STEP_ENDS.findIndex((end) => progress < end);
  const stepState = (i: number) =>
    progress >= STEP_ENDS[i] ? "done" : i === stage ? "active" : "pending";
  const caption = (i: number, text: string) =>
    stepState(i) === "pending" ? undefined : text;

  return (
    <Screen>
      <StatusBar className="absolute left-0 top-0" />

      <div className="absolute left-[46.5px] top-[120px] size-[300px] opacity-45">
        <Image src="/assets/halo-300.png" alt="" width={300} height={300} className="block size-full" />
      </div>
      <div className="absolute left-[76.5px] top-[150px] size-[240px]">
        <Image src="/assets/orbit-ring-240.svg" alt="" width={240} height={240} unoptimized className="block size-full" />
      </div>

      <Mascot
        pose="reading"
        className="absolute left-[96.5px] top-[148px]"
        width={200}
        height={224.719}
      />

      {ORBIT_CHIPS.map(({ element, active, left, top }) => (
        <FiveElement
          key={element}
          element={element}
          active={active}
          size={52}
          className="absolute"
          style={{ left, top }}
        />
      ))}

      <Icon name="icon-sparkle-20" size={20} className="absolute left-[66px] top-[150px]" />
      <Icon name="icon-sparkle-14" size={14} className="absolute left-[318px] top-[380px]" />

      <p className="absolute left-[24px] top-[456px] w-[345px] text-center font-serif text-h2-22">
        연학이가 사주를 읽고 있어요
      </p>
      <p className="absolute left-[59.5px] top-[492px] whitespace-nowrap text-body-m-14 text-text-secondary">
        만세력으로 팔자를 세우고 오행을 헤아리는 중…
      </p>

      {/* progress (24:440) */}
      <div className="absolute left-[24px] top-[536px] flex flex-col items-start gap-[8px] overflow-clip">
        <div className="relative flex h-[18px] w-[345px] shrink-0 items-start justify-between overflow-clip whitespace-nowrap text-[12px] font-bold leading-[18px] text-brand-secondary">
          <p className="relative shrink-0">{STAGE_LABELS[stage === -1 ? 3 : stage]}</p>
          <p className="relative shrink-0">{progress}%</p>
        </div>
        <ProgressBar
          value={proto.active ? progress / 100 : 235 / 345}
          className="w-[345px] shrink-0"
        />
      </div>

      {/* steps (24:446) */}
      <div className="absolute left-[24px] top-[590px] flex w-[345px] flex-col items-start gap-[10px] overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[20px] py-[14px]">
        <LoadingStepRow
          state={stepState(0)}
          title="만세력 변환"
          caption={caption(0, birthCaption(state))}
        />
        <LoadingStepRow
          state={stepState(1)}
          title="사주 팔자 · 오행 분포 계산"
          caption={caption(1, "목 3 · 화 2 · 토 1 · 금 1 · 수 1")}
        />
        <LoadingStepRow
          state={stepState(2)}
          title="학과 매칭 · 적합도 산출"
          caption={caption(2, "120개 학과와 비교 중")}
        />
        <LoadingStepRow
          state={stepState(3)}
          title="결과 문구 정리"
          caption={caption(3, "연학이가 한 줄씩 다듬는 중")}
        />
      </div>

      {state.invited && (
        <Chip
          type="gold"
          className="absolute left-[86px] top-[70px]"
          label="민지님과의 궁합도 함께 계산하고 있어요"
        />
      )}

      <HomeIndicator className="absolute left-0 top-[818px]" />
    </Screen>
  );
}
