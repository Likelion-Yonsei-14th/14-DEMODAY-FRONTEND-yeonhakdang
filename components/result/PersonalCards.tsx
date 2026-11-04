"use client";

import { MascotTipSmall } from "@/components/result/ResultSections";
import { ELEMENT_FILL } from "@/components/result/elementTone";
import { Chip } from "@/components/ui/Chip";
import { InfoBox } from "@/components/ui/InfoBox";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/cn";
import {
  ELEMENTS,
  ELEMENT_HANJA,
  FOCUS,
  SUPPORT_BASIS,
  daewoonBasisLine,
  elementLabel,
  nameFlowLine,
  nameSupportLine,
  supportLine,
  type DaewoonPeriod,
  type Element,
} from "@/lib/saju";
import { usePersonal } from "@/lib/useAnalysis";

function ElementDot({ element }: { element: Element }) {
  return (
    <span className="flex shrink-0 items-center gap-[4px] text-caption-12 text-text-secondary">
      <span className={cn("inline-block size-[8px] rounded-full", ELEMENT_FILL[element])} />
      {ELEMENT_HANJA[element]}
    </span>
  );
}

const SUPPORT_CHIP = { fills: "채움", helps: "도움" } as const;
const FLOW_MARK = { 상생: "생", 상극: "극", 같음: "=" } as const;

function PeriodRow({ p }: { p: DaewoonPeriod }) {
  const focus = p.exam || p.college;
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 items-center gap-[10px] rounded-[10px] px-[10px] py-[8px]",
        focus && "bg-brand-secondary-tint",
      )}
    >
      <span className="flex w-[84px] shrink-0 flex-col whitespace-nowrap">
        <span className="text-caption-12 text-text-secondary">
          만 {p.startAge}~{p.endAge}세
        </span>
        <span className={cn("text-body-m-14", focus && "font-bold")}>
          {p.hangul} <span className="font-serif">{p.hanja}</span>
        </span>
      </span>
      <span className="flex shrink-0 flex-col gap-[2px]">
        <span className="flex gap-[6px]">
          <ElementDot element={p.stemElement} />
          <ElementDot element={p.branchElement} />
        </span>
        {p.support !== "none" && (
          <span className="text-[11px] font-bold leading-[16px] text-brand-accent">
            {SUPPORT_CHIP[p.support]}
          </span>
        )}
      </span>
      <span className="ml-auto flex shrink-0 gap-[4px]">
        {p.exam && <Chip type="primary" label={FOCUS.exam.short} />}
        {p.college && <Chip label={FOCUS.college.short} />}
      </span>
    </div>
  );
}

/** "나의 10년 운 흐름" — 대운 8개, 입시 · 대학 시절 강조. */
export function DaewoonCard({ className }: { className?: string }) {
  const personal = usePersonal();
  if (!personal) return null;
  const { daewoon: d, target } = personal;
  const exam = d.examIndex === null ? null : d.periods[d.examIndex];

  return (
    <div className={cn("relative flex w-full shrink-0 flex-col items-start gap-[12px]", className)}>
      <SectionTitle
        title="나의 10년 운 흐름"
        caption={`대운 · ${d.forward ? "순행" : "역행"} · 대운수 ${d.number} · 날짜 기준`}
      />
      <div className="relative flex w-full shrink-0 flex-col gap-[4px] rounded-[16px] border border-line-default bg-surface-default p-[8px]">
        {d.periods.map((p) => (
          <PeriodRow key={p.hangul} p={p} />
        ))}
      </div>
      <MascotTipSmall>
        {exam
          ? `입시 때는 ${exam.hangul} 대운!\n${exam.support === "none" ? "내 강점으로 밀고 가자" : `${target} 기운이 힘이 돼`}`
          : `입시 땐 아직 대운 전이야\n타고난 기운으로 가자`}
      </MascotTipSmall>
      <div className="flex w-full flex-col gap-[4px]">
        {exam && (
          <p className="text-caption-12 text-text-secondary">
            {FOCUS.exam.label}(만 {d.examAge}세): {supportLine(exam, target)}
          </p>
        )}
        <p className="text-caption-12 text-text-tertiary">{daewoonBasisLine(d, personal.birth)}</p>
        <p className="text-caption-12 text-text-tertiary">
          채움 · 도움은 부족한 {elementLabel(target)} 기운 기준이에요. {SUPPORT_BASIS.note}
        </p>
      </div>
    </div>
  );
}

/** "이름이 채워주는 기운" — 발음오행. Hidden without a 한글 이름. */
export function NameElementCard({ className }: { className?: string }) {
  const personal = usePersonal();
  const name = personal?.name;
  if (!personal || !name) return null;

  return (
    <div className={cn("relative flex w-full shrink-0 flex-col items-start gap-[12px]", className)}>
      <SectionTitle title="이름이 채워주는 기운" caption="이름 글자의 첫소리로 본 발음오행" />
      <div className="relative flex w-full shrink-0 flex-col gap-[14px] rounded-[16px] border border-line-default bg-surface-default p-[18px]">
        <div className="flex flex-wrap items-center gap-[6px]">
          {name.chars.map((c, i) => (
            <span key={i} className="flex items-center gap-[6px]">
              {i > 0 && (
                <span className="text-caption-12 text-text-tertiary">{FLOW_MARK[name.flow[i - 1].kind]}</span>
              )}
              <span
                className={cn(
                  "flex w-[52px] flex-col items-center gap-[2px] rounded-[12px] border border-line-default py-[8px]",
                  i < name.surnameLength && "bg-bg-subtle",
                )}
              >
                <span className="font-serif text-h3-18">{c.char}</span>
                <ElementDot element={c.element} />
              </span>
            </span>
          ))}
        </div>
        <p className="text-caption-12 text-text-secondary">
          {ELEMENTS.filter((e) => name.counts[e] > 0)
            .map((e) => `${e} ${name.counts[e]}`)
            .join(" · ")}
          {name.missing.length > 0 && ` · 없는 기운 ${name.missing.join("·")}`}
        </p>
        <div className="flex flex-col gap-[4px]">
          <p className="font-bold text-body-m-14">{nameSupportLine(name)}</p>
          <p className="text-body-m-14 text-text-secondary">{nameFlowLine(name)}</p>
        </div>
      </div>
    </div>
  );
}

/** "연학당 계산 기준" — the short note at the bottom of the 결과. */
export function CalcBasisNote({ className }: { className?: string }) {
  return (
    <InfoBox className={className}>
      연학당 계산 기준: 대운은 성별과 만세력 월주가 바뀌는 날(날짜 기준)로, 발음오행은 이름 첫소리(현대 성명학)로,
      십신은 일간과 글자 수로 봐요. 용신 대신 가장 약한 오행을 보완 기운으로 써요.
    </InfoBox>
  );
}
