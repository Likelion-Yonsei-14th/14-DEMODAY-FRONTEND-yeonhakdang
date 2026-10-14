import { InputForm } from "@/components/screens/02-input/InputForm";

/** Figma: 2-2 정보 입력 · 입력 완료(시간 모름) (21:249) */
export function InputFilledNoTime() {
  return (
    <InputForm
      initial={{
        name: "김연학",
        birth: "2008.03.15",
        gender: 0,
        calendar: 0,
        leapMonth: false,
        time: "",
        unknownTime: true,
      }}
    />
  );
}
