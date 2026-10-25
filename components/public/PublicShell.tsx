import Link from "next/link";

import { PublicFooter } from "@/components/public/PublicFooter";
import { SERVICE_NAME } from "@/lib/business";

/**
 * The frame of the server-rendered public pages (/products, /terms, …): a
 * phone-width column with the app's tokens, a home link and the footer.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full w-full flex-1 justify-center bg-bg-subtle">
      <div className="flex w-full max-w-[430px] flex-col bg-bg-base text-text-primary">
        <header className="flex h-[56px] w-full shrink-0 items-center justify-between border-b border-line-default px-[24px]">
          <Link href="/" className="font-serif text-h3-18 font-black">
            {SERVICE_NAME}
          </Link>
          <Link href="/products" className="text-caption-12 font-bold text-brand-secondary">
            상품 및 가격
          </Link>
        </header>
        <main className="flex w-full flex-1 flex-col">{children}</main>
        <PublicFooter />
      </div>
    </div>
  );
}
