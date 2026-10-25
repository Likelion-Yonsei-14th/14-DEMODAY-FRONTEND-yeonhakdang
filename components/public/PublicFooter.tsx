import Link from "next/link";

import { cn } from "@/lib/cn";
import { BUSINESS, POLICY_LINKS } from "@/lib/business";

/**
 * Figma: Pattern/Footer/Business Info (224:3174). No hooks and real links, so
 * it renders into the server HTML of every public page — PG 심사 reads the
 * 사업자 정보 and 약관 links from there, without JavaScript or a login.
 */
export function PublicFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[16px] border-t border-line-default bg-bg-subtle p-[24px] [overflow-wrap:anywhere]",
        className,
      )}
    >
      <nav aria-label="서비스 정책" className="flex w-full flex-wrap items-start gap-x-[16px] gap-y-[8px] text-caption-12 text-text-secondary">
        {POLICY_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={cn("strong" in link && "font-bold")}>
            {link.label}
          </Link>
        ))}
        <Link href="/products">상품 및 가격</Link>
      </nav>
      <address className="flex w-full flex-col gap-[4px] font-medium not-italic text-caption-11 text-text-tertiary">
        <p className="font-bold text-caption-12 text-text-secondary">
          {BUSINESS.name}
          {BUSINESS.taxType && ` ${BUSINESS.taxType}`}
        </p>
        <p className="whitespace-pre-wrap">{`대표자 ${BUSINESS.representative}  |  사업자등록번호 ${BUSINESS.registrationNumber}`}</p>
        <p>통신판매업 신고번호 {BUSINESS.mailOrderNumber}</p>
        <p>주소 {BUSINESS.address}</p>
        <p className="whitespace-pre-wrap">{`고객센터 ${BUSINESS.phone}  |  ${BUSINESS.email}`}</p>
        <p>호스팅 서비스 제공자 {BUSINESS.hosting}</p>
      </address>
      <div className="w-full font-medium text-caption-11 text-text-tertiary">
        <p>연학당의 사주 결과는 진로 탐색을 위한 참고용 콘텐츠이며, 실제 입시 결과를 보장하지 않습니다.</p>
        <p>© 2026 {BUSINESS.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
