import { InputForm } from "@/components/screens/02-input/InputForm";

/** Figma: 2-1 정보 입력 · 빈 상태 (21:172) */
export function InputEmpty() {
  return (
    <InputForm
      initial={{
        name: "",
        birth: "",
        gender: 0,
        calendar: 0,
        leapMonth: false,
        time: "",
        unknownTime: false,
      }}
    />
  );
}
