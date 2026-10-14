import { ShareScreen } from "@/components/screens/05-share/ShareScreen";

/** Figma: 5-2 공유하기 · 합격자 명단 카드 (1:1) + 링크 복사 토스트 (28:1120) */
export function ShareRosterCard() {
  return (
    <ShareScreen
      initialCard="roster"
      initialRatio="카톡 1:1"
      staticToast="초대 링크를 복사했어요"
    />
  );
}
