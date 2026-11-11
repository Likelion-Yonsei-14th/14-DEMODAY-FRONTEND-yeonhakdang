"use client";

import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { useProto } from "@/lib/proto";

export function RosterLoginGate({ target }: { target: string }) {
  const proto = useProto();
  return (
    <Screen fit>
      <TopBar title="동기 합격자 명단" />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[20px] px-[24px] text-center">
        <h1 className="font-serif text-h2-22">로그인하고 동기 명단을 확인해요</h1>
        <p className="text-body-m-14 text-text-secondary">
          친구와 서로의 명단에 등록하고<br />다른 기기에서도 이어서 볼 수 있어요.
        </p>
        <Button type="kakao" label="카카오 로그인하고 계속하기" onPress={() => proto.requireLogin(target)} />
        <Button type="ghost" size="M" label="내 분석으로 돌아가기" onPress={() => proto.reset(proto.state.analyzed ? "3-4" : "1-1")} />
      </div>
    </Screen>
  );
}
