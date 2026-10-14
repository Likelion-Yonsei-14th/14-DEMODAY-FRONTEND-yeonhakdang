import { cn } from "@/lib/cn";

/**
 * Figma: Pattern/Headline — 랜딩 (74:2959) uses Display/32 with a
 * brand-secondary overline; 로그인 (74:2946) uses Heading/H1 26 with a
 * brand-primary overline.
 */
export function Headline({
  overline,
  overlineTone = "secondary",
  title,
  size = "display",
  body,
  className,
}: {
  overline?: string;
  overlineTone?: "secondary" | "primary";
  title: React.ReactNode;
  size?: "display" | "h1";
  body?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-start gap-[10px] overflow-clip",
        className,
      )}
    >
      {overline && (
        <p
          className={cn(
            "relative shrink-0 whitespace-nowrap text-overline-12",
            overlineTone === "primary"
              ? "text-brand-primary"
              : "text-brand-secondary",
          )}
        >
          {overline}
        </p>
      )}
      <div
        className={cn(
          "relative shrink-0 whitespace-pre-line font-serif",
          size === "display" ? "text-display-32" : "text-h1-26",
        )}
      >
        {title}
      </div>
      {body && (
        <div className="relative shrink-0 whitespace-pre-line text-body-m-14 text-text-secondary">
          {body}
        </div>
      )}
    </div>
  );
}
