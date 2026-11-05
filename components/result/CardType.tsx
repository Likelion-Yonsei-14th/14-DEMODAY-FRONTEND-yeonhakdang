import Image from "next/image";

import { cn } from "@/lib/cn";

import type { TypeTone } from "@/components/result/elementTone";

/**
 * Figma: Card/Type (17:134) — "나의 학과 유형" card with a mascot badge.
 * Figma draws it navy; `tone` recolours it per 일간 (see typeTone).
 */
export function CardType({
  overline = "나의 학과 유형",
  title,
  description,
  tags,
  tone = { bg: "bg-brand-secondary", ring: "border-brand-secondary-light" },
  art = "/assets/ilgan/round-gap.webp",
  className,
}: {
  overline?: string;
  title: string;
  description: string;
  tags: string[];
  tone?: TypeTone;
  /** 일간 원형 그림 (ilganArt(...).round). */
  art?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[8px] overflow-clip rounded-[20px] p-[20px]",
        tone.bg,
        className,
      )}
    >
      <p className="relative shrink-0 whitespace-nowrap text-overline-12 text-text-inverse opacity-80">
        {overline}
      </p>
      {/* 204, not Figma's 220: the 100px badge reaches x 229, and a 220 title's second line ran 4px into it. */}
      <div className="relative w-[204px] shrink-0 whitespace-pre-line font-serif text-h1-26 text-text-inverse">
        {title}
      </div>
      <p className="relative w-[220px] shrink-0 text-body-m-14 text-text-inverse opacity-[0.92]">
        {description}
      </p>
      <div className="relative flex shrink-0 items-start gap-[6px] overflow-clip">
        {tags.map((tag) => (
          <div
            key={tag}
            className="relative flex shrink-0 items-start overflow-clip rounded-full border border-text-inverse px-[10px] py-[4px]"
          >
            <p className="relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px] text-text-inverse">
              {tag}
            </p>
          </div>
        ))}
      </div>

      {/* mascot badge (17:145) — 92px in Figma, drawn a touch larger (100px) to show the 일간 art. */}
      <div
        className={cn(
          "absolute right-[16px] top-[16px] size-[100px] overflow-clip rounded-full border-[3px] bg-bg-base",
          tone.ring,
        )}
      >
        <Image
          src={art}
          alt=""
          fill
          sizes="100px"
          className="pointer-events-none scale-[1.04] object-cover"
        />
      </div>
    </div>
  );
}
