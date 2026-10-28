/**
 * data/majors.csv (엑셀·구글 시트로 고치는 학과 표) → data/majors.json (앱이 읽는 데이터).
 * Runs before `npm run dev` / `npm run build`, so a Vercel deploy always uses
 * the latest table. Any bad row stops the build and names the line to fix.
 *
 * 학과군 rows follow 대학 교육편제단위 표준분류체계(2021): 5 대계열 · 34 중계열
 * · 184 소계열, minus the N.C.E(미분류) rows.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "data", "majors.csv");
const OUT = join(root, "data", "majors.json");

const COLUMNS = ["id", "대계열", "중계열", "학과군", "대표학과", "주오행", "보조오행", "근거", "노출"];
const ELEMENTS = ["목", "화", "토", "금", "수"];

/** RFC 4180-ish: quoted fields may hold commas, quotes ("") and line breaks. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const text = readFileSync(SRC, "utf8").replace(/^﻿/, "");
const [header, ...body] = parseCsv(text);

const errors = [];
const headerNames = header.map((h) => h.trim());
if (headerNames.join(",") !== COLUMNS.join(",")) {
  errors.push(`1번째 줄(제목 줄)은 정확히 "${COLUMNS.join(",")}" 이어야 해요. 지금: "${headerNames.join(",")}"`);
}

const ids = new Set();
const majors = [];
body.forEach((cells, i) => {
  const line = i + 2;
  if (cells.every((c) => c.trim() === "")) return; // blank line
  if (cells.length !== COLUMNS.length) {
    errors.push(`${line}번째 줄: 칸이 ${COLUMNS.length}개여야 하는데 ${cells.length}개예요. (근거에 쉼표가 있다면 엑셀에서 저장하면 자동으로 처리돼요)`);
    return;
  }
  const r = Object.fromEntries(COLUMNS.map((col, j) => [col, cells[j].trim()]));
  if (!r.id) errors.push(`${line}번째 줄: id가 비어 있어요.`);
  else if (ids.has(r.id)) errors.push(`${line}번째 줄: id "${r.id}"가 다른 줄과 겹쳐요.`);
  ids.add(r.id);
  for (const col of ["대계열", "중계열", "학과군", "대표학과", "근거"]) {
    if (!r[col]) errors.push(`${line}번째 줄 (${r.id}): ${col}이(가) 비어 있어요.`);
  }
  if (!ELEMENTS.includes(r.주오행)) {
    errors.push(`${line}번째 줄 (${r.id}): 주오행은 ${ELEMENTS.join("·")} 중 하나여야 해요. 지금: "${r.주오행}"`);
  }
  if (r.보조오행 && !ELEMENTS.includes(r.보조오행)) {
    errors.push(`${line}번째 줄 (${r.id}): 보조오행은 비우거나 ${ELEMENTS.join("·")} 중 하나여야 해요. 지금: "${r.보조오행}"`);
  }
  if (r.보조오행 && r.보조오행 === r.주오행) {
    errors.push(`${line}번째 줄 (${r.id}): 보조오행이 주오행과 같아요. 다르게 하거나 비워 주세요.`);
  }
  if (r.노출 !== "Y" && r.노출 !== "N") {
    errors.push(`${line}번째 줄 (${r.id}): 노출은 Y 또는 N이어야 해요. 지금: "${r.노출}"`);
  }
  if (r.노출 !== "Y") return;
  majors.push({
    id: r.id,
    대계열: r.대계열,
    중계열: r.중계열,
    학과군: r.학과군,
    대표학과: r.대표학과.split("/").map((s) => s.trim()).filter(Boolean),
    주오행: r.주오행,
    보조오행: r.보조오행 || null,
    근거: r.근거,
  });
});

if (majors.length === 0 && errors.length === 0) errors.push("노출이 Y인 학과가 하나도 없어요.");

if (errors.length > 0) {
  console.error(`\n✖ data/majors.csv에 고칠 곳이 ${errors.length}개 있어요:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

const json = `${JSON.stringify(majors, null, 2)}\n`;
let previous = "";
try {
  previous = readFileSync(OUT, "utf8");
} catch {}
if (previous !== json) writeFileSync(OUT, json);
console.log(`✓ data/majors.csv → data/majors.json (학과군 ${majors.length}개)`);
