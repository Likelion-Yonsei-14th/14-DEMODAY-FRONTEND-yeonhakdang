"use client";

import { useRef, useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen, ScreenScroll } from "@/components/layout/Screen";
import { MascotTip } from "@/components/mascot/MascotTip";
import { BottomCta } from "@/components/ui/BottomCta";
import { Button } from "@/components/ui/Button";
import { CheckboxRow } from "@/components/ui/CheckboxRow";
import { InfoBox } from "@/components/ui/InfoBox";
import { SegmentedField } from "@/components/ui/SegmentedControl";
import { StepProgress } from "@/components/ui/StepProgress";
import { TextField } from "@/components/ui/TextField";
import { trackAnalysisStart } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";
import { birthError } from "@/lib/saju";

import { commitAnalysisInput, inputValues, type InputValues } from "@/lib/analysisInput";
import { flushAnalysisProfile } from "@/lib/analysisProfile";
import { ApiError, errorMessage, USE_BACKEND } from "@/lib/backend";
export type { InputValues } from "@/lib/analysisInput";

/** Half-hour slots for the 태어난 시간 picker. */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 ? "30분" : "00분";
  const half = h < 12 ? "오전" : "오후";
  return `${half} ${h % 12 === 0 ? 12 : h % 12}시 ${m}`;
});

/** Keeps digits only and re-inserts the dots: 20080315 → 2008.03.15 */
function formatBirth(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;
}

/**
 * The 2-1 / 2-2 / 2-3 정보 입력 screen. The three Figma frames are states of
 * this one form — empty, filled with 시간 모름, and a date-validation error —
 * so the mascot copy, the 윤달 row (음력 only), the dimmed time picker and the
 * info box are all derived from the values rather than hand-placed.
 */
export function InputForm({ initial }: { initial: InputValues }) {
  const proto = useProto();
  const [local, setLocal] = useState<InputValues>(() => inputValues(proto.active ? proto.state : initial));
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState("");
  const [needsReload, setNeedsReload] = useState(false);
  const v = local;
  const set = (patch: Partial<InputValues>) => {
    if (!savingRef.current) setLocal((s) => ({ ...s, ...patch }));
  };
  const submit = async () => {
    if (savingRef.current || !complete) return;
    savingRef.current = true;setSaving(true);setSaveError("");setNeedsReload(false);
    try {
      const state = proto.state;
      const save = USE_BACKEND && state.loggedIn && state.account
        ? (profile: Parameters<typeof flushAnalysisProfile>[0]) => flushAnalysisProfile(profile, true) : undefined;
      const patch = await commitAnalysisInput(state, v, save);
      const next = state.afterInput ?? "3-1";
      if (!state.afterInput) trackAnalysisStart();
      proto.update(patch);
      proto.go(next);
    } catch (error) {
      setSaveError(errorMessage(error));
      proto.toast(`저장하지 못했어요. ${errorMessage(error)}`);
      setNeedsReload(error instanceof ApiError && ["PROFILE_CONFLICT", "PROFILE_ACCOUNT_CHANGED"].includes(error.code));
    } finally { savingRef.current = false;setSaving(false); }
  };

  // 양력·음력·윤달 all checked against the 만세력, so 음력 2월 30일 is caught too.
  const error = birthError(v);
  const nameOk = v.name.trim().length >= 2;
  const birthOk = v.birth.length === 10 && !error;
  const complete = nameOk && birthOk && (v.unknownTime || v.time !== "");

  const tip = error
    ? "앗, 날짜를 한 번만\n다시 확인해 줘!"
    : complete
      ? "좋아, 이제 분석만\n하면 돼!"
      : "태어난 날을 알려주면\n사주로 학과를 읽어줄게!";

  return (
    <Screen fit>
      <TopBar title={proto.state.analyzed ? "내 정보 수정" : "내 정보 입력"} onBack={() => { if (!savingRef.current) proto.back(); }} />

      {/* form (21:192 · 21:269 · 21:352) */}
      <ScreenScroll>
        <div
          className={cn(
            "flex w-[393px] flex-col items-start px-[24px] pb-[24px] pt-[6px]",
            error ? "gap-[12px]" : "gap-[14px]",
          )}
        >
          <StepProgress label="STEP 1 / 2 · 사주 정보" value={235 / 345} />
          {saveError && <div role="alert" className="w-full whitespace-normal break-keep text-body-m-14 text-brand-primary">
            <p>저장하지 못했어요. {saveError}</p>
            {needsReload && <button type="button" onClick={() => window.location.reload()} className="mt-2 underline">최신 정보 다시 불러오기</button>}
          </div>}
          <MascotTip>{tip}</MascotTip>
          <TextField
            label="이름"
            value={v.name}
            placeholder="2~10자로 입력해 주세요"
            helper={v.name ? undefined : "이름 첫소리로 발음오행을 봐요 · 명단과 공유 카드에도 표시돼요"}
            maxLength={10}
            onChange={(name) => set({ name })}
          />
          <TextField
            label="생년월일"
            value={v.birth}
            placeholder="YYYY.MM.DD"
            error={error}
            inputMode="numeric"
            onChange={(birth) => set({ birth: formatBirth(birth) })}
          />
          <div className="relative flex shrink-0 items-start gap-[13px] overflow-clip">
            <SegmentedField
              label="성별"
              options={["남자", "여자"]}
              selected={v.gender}
              onChange={(gender) => set({ gender })}
            />
            <SegmentedField
              label="양력 / 음력"
              options={["양력", "음력"]}
              selected={v.calendar}
              onChange={(calendar) => set({ calendar, leapMonth: false })}
            />
          </div>
          {v.calendar === 1 && (
            <CheckboxRow
              label="윤달이에요"
              checked={v.leapMonth}
              onToggle={() => set({ leapMonth: !v.leapMonth })}
            />
          )}
          {/* The select is dimmed while "시간 모름" is checked. */}
          <TextField
            label="태어난 시간"
            type="select"
            value={v.unknownTime ? undefined : v.time}
            placeholder={v.unknownTime ? "시간 모름" : "시 · 분 선택"}
            options={TIME_OPTIONS}
            disabled={v.unknownTime}
            onChange={(time) => set({ time })}
            className={cn(v.unknownTime && "opacity-45")}
          />
          <CheckboxRow
            label="태어난 시간을 몰라요"
            checked={v.unknownTime}
            onToggle={() => set({ unknownTime: !v.unknownTime })}
          />
          {v.unknownTime && (
            <InfoBox>
              태어난 시간을 몰라도 괜찮아요. 시주를 뺀 여섯 글자로 학과를 분석해요.
            </InfoBox>
          )}
        </div>
      </ScreenScroll>

      <Bottom from={740}>
        <BottomCta className="absolute left-0 top-[740px]">
          <Button
            label={saving ? "저장하고 있어요…" : proto.state.afterInput ? "입력 완료 · 구매 계속하기" : proto.state.analyzed ? "수정 내용 저장 · 다시 분석" : "내 학과 분석하기"}
            disabled={!complete || saving || needsReload}
            onPress={() => void submit()}
          />
        </BottomCta>
      </Bottom>
    </Screen>
  );
}
