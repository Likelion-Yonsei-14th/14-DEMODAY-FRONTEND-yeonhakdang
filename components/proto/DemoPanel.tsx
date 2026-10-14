"use client";

import { cn } from "@/lib/cn";
import type { DemoFlags } from "@/lib/proto";

const SWITCHES: Array<{ key: keyof DemoFlags; label: string; caption: string }> = [
  { key: "slowAnalysis", label: "분석 지연", caption: "다음 분석 1회 → 3-2 재시도" },
  { key: "payFail", label: "결제 실패", caption: "다음 결제 1회 → 7-5" },
  { key: "emptyRoster", label: "빈 명단", caption: "초대로 들어와도 4-2" },
];

/**
 * Presenter controls: restart the flow, force the failure / empty branches,
 * and pop the exception screens. Lives in the desktop sidebar and, on a
 * phone, in a sheet opened by triple-tapping the status bar.
 */
export function DemoPanel({
  demo,
  onDemo,
  onRestart,
  onShow,
  className,
}: {
  demo: DemoFlags;
  onDemo: (patch: Partial<DemoFlags>) => void;
  onRestart: (invited: boolean) => void;
  onShow: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-[12px]", className)}>
      <div className="flex flex-col gap-[8px]">
        <button
          type="button"
          onClick={() => onRestart(false)}
          className="proto-tap h-[44px] rounded-[12px] bg-brand-primary text-label-button-15 text-text-inverse"
        >
          처음부터 다시 (1-1 랜딩)
        </button>
        <button
          type="button"
          onClick={() => onRestart(true)}
          className="proto-tap h-[44px] rounded-[12px] border-[1.5px] border-brand-secondary bg-surface-default text-label-button-15 text-brand-secondary"
        >
          친구 초대 링크로 시작 (1-2)
        </button>
      </div>

      <div className="flex flex-col rounded-[16px] border border-line-default bg-surface-default px-[14px] py-[6px]">
        {SWITCHES.map(({ key, label, caption }) => (
          <label key={key} className="flex cursor-pointer items-center gap-[10px] py-[8px]">
            <input
              type="checkbox"
              checked={demo[key]}
              onChange={(e) => onDemo({ [key]: e.target.checked })}
              className="size-[18px] accent-brand-secondary"
            />
            <span className="flex flex-col">
              <span className="text-body-m-14 font-bold">{label}</span>
              <span className="text-caption-12 text-text-secondary">{caption}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="flex gap-[8px]">
        <button
          type="button"
          onClick={() => onShow("9-2")}
          className="proto-tap h-[36px] flex-1 rounded-[10px] border border-line-default bg-surface-default text-caption-12 font-bold"
        >
          네트워크 오류 (9-2)
        </button>
        <button
          type="button"
          onClick={() => onShow("9-4")}
          className="proto-tap h-[36px] flex-1 rounded-[10px] border border-line-default bg-surface-default text-caption-12 font-bold"
        >
          인앱 안내 (9-4)
        </button>
      </div>
    </div>
  );
}
