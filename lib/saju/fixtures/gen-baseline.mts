/** One-off: writes top3-baseline.json from the current rules. Kept so the baseline can be audited. */
import { readFileSync, writeFileSync } from "node:fs";
import { analyze } from "../analyze.ts";
const read = (n: string) => JSON.parse(readFileSync(new URL(`../../../data/${n}`, import.meta.url), "utf8"));
const content = { majors: read("majors.json"), dayMasters: read("day-masters.json"), insights: read("insights.json"), scoring: read("scoring.json"), sipsin: { aptitude: read("sipsin-aptitude.json"), majors: read("sipsin-majors.json") } };
const TIMES = ["", "오전 7시 45분", "오후 11시 40분"];
const out: Record<string, Array<[string, number]>> = {};
for (let y = 1990; y <= 2012; y++) for (let m = 1; m <= 12; m += 1) for (const d of [4, 15, 28]) {
  for (const t of TIMES) {
    const birth = `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
    const r = analyze({ birth, calendar: 0, leapMonth: false, time: t, unknownTime: t === "" }, content);
    if (!r.ok) throw new Error(birth);
    out[`${birth} ${t || "모름"}`] = r.analysis.top.map((p) => [p.major.id, p.display]);
  }
}
writeFileSync(new URL("./top3-baseline.json", import.meta.url), JSON.stringify(out));
console.log(Object.keys(out).length);
