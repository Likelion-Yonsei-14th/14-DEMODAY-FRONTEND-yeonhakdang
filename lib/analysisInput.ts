import { analysisProfile, type AnalysisProfile } from "./analysisProfile.ts";
import type { ProtoState } from "./proto";

export type InputValues = Pick<ProtoState, "name" | "birth" | "gender" | "calendar" | "leapMonth" | "time" | "unknownTime">;
export function inputValues(input: InputValues): InputValues {
  const { name, birth, gender, calendar, leapMonth, time, unknownTime } = input;
  return { name, birth, gender, calendar, leapMonth, time, unknownTime };
}
/** Keep the displayed account unchanged until the explicit server save succeeds. */
export async function commitAnalysisInput(state: ProtoState, input: InputValues, save?: (profile: AnalysisProfile) => Promise<void>): Promise<Partial<ProtoState>> {
  const patch = { ...inputValues(input), name: input.name.trim(), savedResult: null, afterInput: null };
  if (save) await save(analysisProfile({ ...state, ...patch }));
  return patch;
}
