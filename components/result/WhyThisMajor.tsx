"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { useAnalysis } from "@/lib/useAnalysis";

/**
 * "왜 이 학과일까?" — the 1위 학과's reasoning in four steps (사주 글자 →
 * 오행 세기 → 점수 계산 → 결론), folded by default under the TOP 3.
 */
export function WhyThisMajor({ className }: { className?: string }) {
  const { top, reasons } = useAnalysis();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start overflow-clip rounded-[20px] border border-line-default bg-surface-default",
        className,
      )}
    >
      <Tap
        onPress={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-[12px] px-[20px] py-[16px] text-left"
      >
        <span className="flex min-w-px flex-col gap-[2px]">
          <span className="font-bold text-body-l-16">왜 {top[0].major.대표학과[0]}일까?</span>
          <span className="text-caption-12 text-text-secondary">사주 글자부터 점수까지, 4단계로 보여줄게요</span>
        </span>
        <Icon name="icon-chevron-down" className={cn("transition-transform", open && "rotate-180")} />
      </Tap>

      {open && (
        <ol className="flex w-full flex-col gap-[16px] border-t border-line-default px-[20px] pb-[20px] pt-[16px]">
          {reasons.map((step) => (
            <li key={step.title} className="flex flex-col gap-[6px]">
              <p className="font-bold text-body-m-14 text-brand-secondary">{step.title}</p>
              {step.lines.map((line) => (
                <p key={line} className="text-caption-12 text-text-secondary">
                  {line}
                </p>
              ))}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
