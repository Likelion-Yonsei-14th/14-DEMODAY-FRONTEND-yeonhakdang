import { InputForm } from "@/components/screens/02-input/InputForm";

/** Figma: 2-3 정보 입력 · 오류(날짜 검증) (21:332) */
export function InputDateError() {
  return (
    <InputForm
      initial={{
        name: "김연학",
        birth: "2008.02.30",
        gender: 1,
        calendar: 1,
        leapMonth: false,
        time: "오후 2시 30분",
        unknownTime: false,
      }}
    />
  );
}
