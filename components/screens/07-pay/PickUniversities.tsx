"use client";

import { useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import {
  ChipUniversity,
  UniversityRow,
  UniversitySearchField,
  searchUniversities,
} from "@/components/pay/UniversityPicker";
import { MascotTipSmall } from "@/components/result/ResultSections";
import { BottomCta } from "@/components/ui/BottomCta";
import { Button } from "@/components/ui/Button";
import { purchaseSteps, stepLabel, useProto } from "@/lib/proto";

const MAX = 6;

/** Figma: 7-1 합격 궁합 · 지원 대학 선택 (PAY-05·06) (30:1421) */
export function PickUniversities() {
  const proto = useProto();
  const { state, update } = proto;
  const [query, setQuery] = useState(proto.active ? "" : "성균");
  const picked = state.universities;
  const results = searchUniversities(query);

  const toggle = (name: string) => {
    if (picked.includes(name)) {
      return update({ universities: picked.filter((u) => u !== name) });
    }
    if (picked.length >= MAX) return proto.toast("최대 6곳까지 고를 수 있어요");
    update({ universities: [...picked, name] });
    setQuery("");
  };

  const steps = purchaseSteps(state);
  const next = steps[steps.indexOf("7-1") + 1] ?? "7-3";

  return (
    <Screen>
      <TopBar title="지원 대학 선택" className="absolute left-0 top-[54px]" />

      {/* heading (30:1441) */}
      <div className="absolute left-[24px] top-[118px] flex flex-col items-start gap-[6px] overflow-clip whitespace-nowrap">
        <p className="relative shrink-0 text-overline-12 text-brand-secondary">
          {stepLabel(state, "7-1")}
        </p>
        <p className="relative shrink-0 font-serif text-h2-22">
          지원할 대학을 골라 주세요
        </p>
        <div className="relative flex shrink-0 items-center gap-[4px] overflow-clip text-body-m-14">
          <p className="relative shrink-0 text-text-secondary">최대 6곳까지 ·</p>
          <p className="relative shrink-0 font-bold text-brand-primary">{picked.length}</p>
          <p className="relative shrink-0 text-text-secondary">/ 6 선택</p>
        </div>
      </div>

      {/* Drawn first so a long result list can slide over it. */}
      <MascotTipSmall className="absolute left-[24px] top-[568px] w-[224px]">
        {"소신·적정·안정 골고루\n넣어 보는 걸 추천해!"}
      </MascotTipSmall>

      <UniversitySearchField
        value={query}
        onChange={setQuery}
        className="absolute left-[24px] top-[214px] w-[345px]"
      />

      {/* 선택한 대학 (30:1456) */}
      <div className="absolute left-[24px] top-[280px] flex w-[345px] flex-wrap content-start items-start gap-[8px] overflow-clip">
        {picked.map((name) => (
          <ChipUniversity key={name} label={name} onRemove={() => toggle(name)} />
        ))}
      </div>

      {/* 검색 결과 (30:1469) — pushed below however many chip rows there are */}
      {results.length > 0 && (
        <div
          className="absolute left-[24px] flex w-[345px] flex-col items-start overflow-clip rounded-[16px] border border-line-default bg-surface-default"
          style={{ top: 334 + Math.max(0, Math.ceil(picked.length / 3) - 1) * 48 }}
        >
          {results.map((u, i) => (
            <UniversityRow
              key={`${u.name}-${u.campus}`}
              match={u.match}
              rest={u.rest}
              campus={u.campus}
              divider={i > 0}
              added={picked.includes(u.name)}
              onPress={() => toggle(u.name)}
            />
          ))}
        </div>
      )}

      {results.length === 0 && (
        <p className="absolute left-[24px] top-[400px] w-[345px] text-center text-body-m-14 text-text-tertiary">
          {query.trim()
            ? "검색 결과가 없어요. 다른 이름으로 찾아보세요"
            : "대학 이름을 검색해서 추가해 주세요"}
        </p>
      )}

      <Bottom from={740}>
        <BottomCta className="absolute left-0 top-[740px]">
          <Button
            label={picked.length ? `${picked.length}곳으로 다음 단계` : "대학을 1곳 이상 골라 주세요"}
            disabled={picked.length === 0}
            onPress={() => proto.go(next)}
          />
        </BottomCta>
      </Bottom>
    </Screen>
  );
}
