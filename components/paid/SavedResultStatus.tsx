"use client";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
export function SavedResultStatus({ error }: { error: string | null }) {
  return <Screen fit><TopBar title="구매한 결과" /><div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center"><p>{error ?? "구매 당시 저장된 결과를 불러오고 있어요…"}</p>{error && <button type="button" className="rounded-[14px] bg-brand-primary px-6 py-3 text-text-inverse" onClick={() => window.location.reload()}>다시 불러오기</button>}</div></Screen>;
}
