"use client";

import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/** Figma: Pattern/Footer/Business Info (224:3174). */
export function BusinessFooter({ className }: { className?: string }) {
  const proto = useProto();

  return (
    <footer
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[16px] border-t border-line-default bg-bg-subtle p-[24px] [overflow-wrap:anywhere]",
        className,
      )}
    >
      <nav aria-label="서비스 정책" className="flex w-full flex-wrap items-start gap-x-[16px] gap-y-[8px] text-caption-12 text-text-secondary">
        <a href="/about">서비스 소개</a>
        <a href="/terms">이용약관</a>
        <a href="/privacy" className="font-bold">개인정보처리방침</a>
        <a href="/refund" className="font-bold">환불정책</a>
        <Tap onPress={() => proto.toast("청소년보호정책 전문은 준비 중이에요")}>청소년보호정책</Tap>
      </nav>
      <div className="flex w-full flex-col gap-[4px] font-medium text-caption-11 text-text-tertiary">
        <p className="font-bold text-caption-12 text-text-secondary">부캉이</p>
        <p className="whitespace-pre-wrap">{"대표: 이가영  |  사업자등록번호 898-23-02520"}</p>
        <p>통신판매업 신고번호 [신고 후 기재]</p>
        <p>주소 서울특별시 성동구 성수이로 137, 102동 302호(성수동2가, 성수동아이파크)</p>
        <p className="whitespace-pre-wrap">고객센터 [유선 전화번호, 휴대폰 불가]  |  <a href="mailto:emilygylee@yonsei.ac.kr">emilygylee@yonsei.ac.kr</a></p>
        <p>호스팅 서비스 제공자 Vercel Inc.</p>
      </div>
      <div className="w-full font-medium text-caption-11 text-text-tertiary">
        <p>연학당의 사주 결과는 진로 탐색을 위한 참고용 콘텐츠이며, 실제 입시 결과를 보장하지 않습니다.</p>
        <p>© 2026 부캉이. All rights reserved.</p>
      </div>
    </footer>
  );
}
