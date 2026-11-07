"use client";

import { Button } from "@/components/ui/Button";
import { useProto } from "@/lib/proto";

export function AnalysisSessionPanel() {
  const proto = useProto();
  return (
    <section aria-label="분석과 로그인 상태" className="flex w-full flex-col gap-3 rounded-2xl border border-line-default bg-surface-default p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-m-14 font-bold">{proto.state.loggedIn ? "카카오 로그인됨" : "게스트 이용 중"}</p>
        <span className="text-caption-12 text-text-secondary">무료 분석 결과</span>
      </div>
      <p className="text-caption-12 text-text-secondary">
        {proto.state.loggedIn
          ? "다른 정보로 다시 분석해도 로그인과 구매 내역은 유지돼요."
          : "회원 로그인 없이 확인한 결과예요. 카카오로 로그인해도 지금 입력과 결과는 유지돼요."}
      </p>
      {!proto.state.loggedIn && (
        <Button type="kakao" size="M" label="현재 결과 유지하고 카카오 로그인" onPress={() => proto.requireLogin("3-4")} />
      )}
      <Button type="outline" size="M" label="다시 분석하기" onPress={proto.restartAnalysis} />
      <p className="text-caption-12 text-text-tertiary">다시 분석하면 현재 입력 정보와 분석 결과가 초기화돼요.</p>
    </section>
  );
}
