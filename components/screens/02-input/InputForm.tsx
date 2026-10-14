"use client";

import { useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import { MascotTip } from "@/components/mascot/MascotTip";
import { BottomCta } from "@/components/ui/BottomCta";
import { Button } from "@/components/ui/Button";
import { CheckboxRow } from "@/components/ui/CheckboxRow";
import { InfoBox } from "@/components/ui/InfoBox";
import { SegmentedField } from "@/components/ui/SegmentedControl";
import { StepProgress } from "@/components/ui/StepProgress";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { useProto, type ProtoState } from "@/lib/proto";

export type InputValues = Pick<
  ProtoState,
  "name" | "birth" | "gender" | "calendar" | "leapMonth" | "time" | "unknownTime"
>;

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

function birthError(birth: string): string | undefined {
  const d = birth.replace(/\D/g, "");
  if (d.length < 8) return undefined;
  const y = Number(d.slice(0, 4));
  const m = Number(d.slice(4, 6));
  const day = Number(d.slice(6, 8));
  const date = new Date(y, m - 1, day);
  const exists =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === day;
  if (!exists) return "존재하지 않는 날짜예요. 다시 확인해 주세요";
  // A fixed range rather than "today", so the frames prerender identically.
  if (y < 1900 || y > 2020) return "1900~2020년 사이의 날짜로 입력해 주세요";
  return undefined;
}

/**
 * The 2-1 / 2-2 / 2-3 정보 입력 screen. The three Figma frames are states of
 * this one form — empty, filled with 시간 모름, and a date-validation error —
 * so the mascot copy, the 윤달 row (음력 only), the dimmed time picker and the
 * info box are all derived from the values rather than hand-placed.
 */
export function InputForm({ initial }: { initial: InputValues }) {
  const proto = useProto();
  const [local, setLocal] = useState(initial);
  const v: InputValues = proto.active ? proto.state : local;
  const set = (patch: Partial<InputValues>) =>
    proto.active ? proto.update(patch) : setLocal((s) => ({ ...s, ...patch }));

  const error = birthError(v.birth);
  const nameOk = v.name.trim().length >= 2;
  const birthOk = v.birth.length === 10 && !error;
  const complete = nameOk && birthOk && (v.unknownTime || v.time !== "");

  const tip = error
    ? "앗, 날짜를 한 번만\n다시 확인해 줘!"
    : complete
      ? "좋아, 이제 분석만\n하면 돼!"
      : "태어난 날을 알려주면\n사주로 학과를 읽어줄게!";

  return (
    <Screen>
      <TopBar title="내 정보 입력" className="absolute left-0 top-[54px]" />

      {/* form (21:192 · 21:269 · 21:352) */}
      <div
        className={cn(
          "absolute left-0 top-[106px] flex w-[393px] flex-col items-start overflow-clip px-[24px] pt-[6px]",
          error ? "gap-[12px]" : "gap-[14px]",
          proto.active && "screen-scroll max-h-[634px] pb-[16px]",
        )}
      >
        <StepProgress label="STEP 1 / 2 · 사주 정보" value={235 / 345} />
        <MascotTip>{tip}</MascotTip>
        <TextField
          label="이름 (닉네임)"
          value={v.name}
          placeholder="2~10자로 입력해 주세요"
          helper={v.name ? undefined : "합격자 명단과 공유 카드에 표시돼요"}
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

      <Bottom from={740}>
        <BottomCta className="absolute left-0 top-[740px]">
          <Button
            label="내 학과 분석하기"
            disabled={!complete}
            onPress={() => proto.go("3-1")}
          />
        </BottomCta>
      </Bottom>
    </Screen>
  );
}
