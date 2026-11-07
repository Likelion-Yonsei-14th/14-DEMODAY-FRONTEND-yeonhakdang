"use client";

import { Button } from "@/components/ui/Button";
import { useProto } from "@/lib/proto";

export function AnalysisSessionPanel() {
  const proto = useProto();
  return (
    <section aria-label="결과 확인 후 다음 단계" className="flex w-full flex-col gap-3 border-t border-line-default pt-6">
      {!proto.state.loggedIn && (
        <>
          <Button type="kakao" label="카카오 로그인" onPress={() => proto.requireLogin("3-4")} />
          <p className="text-center text-caption-12 text-text-secondary">로그인해도 지금 입력과 결과는 그대로 유지돼요.</p>
        </>
      )}
      <Button type="outline" label="다시 분석하기" onPress={proto.restartAnalysis} />
      <p className="text-center text-caption-12 text-text-tertiary">
        현재 입력과 결과를 지우고 새로 시작해요.
        {proto.state.loggedIn && " 로그인과 구매 내역은 유지돼요."}
      </p>
    </section>
  );
}
