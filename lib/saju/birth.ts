/**
 * The 정보 입력 form's values → a checked 양력 date and time, or the message
 * to show under 생년월일. Pure: the same input always gives the same answer.
 */
import { lunarToSolar } from "@fullstackfamily/manseryeok";

export type BirthInput = {
  /** "YYYY.MM.DD", possibly partial while typing. */
  birth: string;
  /** 0 양력, 1 음력 */
  calendar: 0 | 1;
  leapMonth: boolean;
  /** A picker label such as "오후 2시 30분"; "" when unset. */
  time: string;
  unknownTime: boolean;
};

export type SolarBirth = {
  year: number;
  month: number;
  day: number;
  /** null when the time is unknown: 시주 is left out. */
  hour: number | null;
  minute: number;
};

/** A fixed range rather than "today", so the frames prerender identically. */
export const BIRTH_YEAR_MIN = 1900;
export const BIRTH_YEAR_MAX = 2020;

function parseDigits(birth: string): { y: number; m: number; d: number } | undefined {
  const digits = birth.replace(/\D/g, "");
  if (digits.length < 8) return undefined;
  return {
    y: Number(digits.slice(0, 4)),
    m: Number(digits.slice(4, 6)),
    d: Number(digits.slice(6, 8)),
  };
}

function solarExists(y: number, m: number, d: number): boolean {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** "오후 2시 30분" → 14:30, "오전 12시 00분" → 0:00. */
export function parseTimeLabel(label: string): { hour: number; minute: number } | undefined {
  const match = /^(오전|오후)\s*(\d{1,2})시\s*(\d{1,2})분$/.exec(label.trim());
  if (!match) return undefined;
  const h12 = Number(match[2]) % 12;
  const minute = Number(match[3]);
  if (Number(match[2]) > 12 || minute > 59) return undefined;
  return { hour: match[1] === "오후" ? h12 + 12 : h12, minute };
}

export type BirthResult =
  | { ok: true; solar: SolarBirth }
  | { ok: false; error: string }
  /** Not fully typed yet: nothing to say. */
  | { ok: false; error: undefined };

export function resolveBirth(input: BirthInput): BirthResult {
  const parts = parseDigits(input.birth);
  if (!parts) return { ok: false, error: undefined };
  const { y, m, d } = parts;

  if (y < BIRTH_YEAR_MIN || y > BIRTH_YEAR_MAX) {
    return { ok: false, error: `${BIRTH_YEAR_MIN}~${BIRTH_YEAR_MAX}년 사이의 날짜로 입력해 주세요` };
  }

  let solar: { year: number; month: number; day: number };
  if (input.calendar === 1) {
    if (m < 1 || m > 12 || d < 1 || d > 30) {
      return { ok: false, error: "존재하지 않는 음력 날짜예요. 다시 확인해 주세요" };
    }
    try {
      solar = lunarToSolar(y, m, d, input.leapMonth).solar;
    } catch {
      if (input.leapMonth) {
        // Either the year has no 윤달 in that month, or that day doesn't exist in it.
        let leapExists = true;
        try {
          lunarToSolar(y, m, 1, true);
        } catch {
          leapExists = false;
        }
        if (!leapExists) return { ok: false, error: `${y}년 음력 ${m}월에는 윤달이 없어요` };
      }
      return { ok: false, error: "존재하지 않는 음력 날짜예요. 다시 확인해 주세요" };
    }
  } else {
    if (!solarExists(y, m, d)) return { ok: false, error: "존재하지 않는 날짜예요. 다시 확인해 주세요" };
    solar = { year: y, month: m, day: d };
  }

  const time = input.unknownTime ? undefined : parseTimeLabel(input.time);
  return {
    ok: true,
    solar: { ...solar, hour: time?.hour ?? null, minute: time?.minute ?? 0 },
  };
}

/** Just the message for the 생년월일 field (undefined: nothing wrong yet). */
export function birthError(input: BirthInput): string | undefined {
  const result = resolveBirth(input);
  return result.ok ? undefined : result.error;
}
