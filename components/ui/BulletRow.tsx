import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * Figma: Pattern/List/Check Row — 이유 variant (73:2685), built from
 * Pattern/Decor/Bullet Dot (73:2303).
 */
export function BulletRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex shrink-0 items-start gap-[8px] overflow-clip", className)}
    >
      <div className="relative h-[13px] w-[5px] shrink-0">
        <Image
          src="/assets/bullet-dot.svg"
          alt=""
          width={5}
          height={13}
          unoptimized
          className="block size-full"
        />
      </div>
      <p className="relative w-[318px] shrink-0 text-body-m-14 text-text-secondary">
        {children}
      </p>
    </div>
  );
}
