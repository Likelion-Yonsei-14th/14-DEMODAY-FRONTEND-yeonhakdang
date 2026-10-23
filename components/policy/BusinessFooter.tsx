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
        <Tap onPress={() => proto.toast("이용약관 전문은 준비 중이에요")}>이용약관</Tap>
        <Tap onPress={() => proto.toast("개인정보처리방침 전문은 준비 중이에요")} className="font-bold">개인정보처리방침</Tap>
        <Tap onPress={() => proto.go("10-1")} className="font-bold">환불정책</Tap>
        <Tap onPress={() => proto.toast("청소년보호정책 전문은 준비 중이에요")}>청소년보호정책</Tap>
      </nav>
      <div className="flex w-full flex-col gap-[4px] font-medium text-caption-11 text-text-tertiary">
        <p className="font-bold text-caption-12 text-text-secondary">부캉이 [간이과세자인 경우 &apos;간이과세자&apos; 표기]</p>
        <p className="whitespace-pre-wrap">{"대표자 [대표자명]  |  사업자등록번호 [000-00-00000]"}</p>
        <p>통신판매업 신고번호 [제0000-서울서대문-0000호]</p>
        <p>주소 [사업장 주소]</p>
        <p className="whitespace-pre-wrap">{"고객센터 [휴대폰 또는 일반전화]  |  [고객센터 이메일]"}</p>
        <p>호스팅 서비스 제공자 [호스팅사명]</p>
      </div>
      <div className="w-full font-medium text-caption-11 text-text-tertiary">
        <p>연학당의 사주 결과는 진로 탐색을 위한 참고용 콘텐츠이며, 실제 입시 결과를 보장하지 않습니다.</p>
        <p>© 2026 부캉이. All rights reserved.</p>
      </div>
    </footer>
  );
}
