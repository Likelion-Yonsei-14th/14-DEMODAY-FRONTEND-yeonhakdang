import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Figma: SpeechBubble — tail=Left (14:62) | Bottom-Left (14:57),
 * style=Light (white on a hairline border) | Secondary (navy, 14:67).
 */
export function SpeechBubble({
  children,
  tail = "left",
  style = "light",
  className,
}: {
  children: React.ReactNode;
  tail?: "left" | "bottom-left";
  style?: "light" | "secondary";
  className?: string;
}) {
  const isSecondary = style === "secondary";
  return (
    <div
      className={cn(
        "relative flex flex-col items-start",
        tail === "left" ? "pl-[8px]" : "pb-[8px]",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-start overflow-clip rounded-[16px] px-[16px] py-[12px]",
          isSecondary
            ? "bg-brand-secondary"
            : "border border-line-default bg-surface-default",
        )}
      >
        <div
          className={cn(
            "relative shrink-0 whitespace-pre-line font-bold text-body-m-14",
            isSecondary && "text-text-inverse",
          )}
        >
          {children}
        </div>
      </div>
      {tail === "left" ? (
        <div className="absolute left-0 top-[16px] h-[11.667px] w-[10px]">
          <Image
            src="/assets/bubble-tail-left.svg"
            alt=""
            width={10}
            height={12}
            unoptimized
            className="block size-full"
          />
        </div>
      ) : (
        <div className="absolute bottom-[0.14px] left-[24px] h-[8.864px] w-[14px]">
          <Image
            src={
              isSecondary
                ? "/assets/bubble-tail-secondary.svg"
                : "/assets/bubble-tail.svg"
            }
            alt=""
            width={14}
            height={9}
            unoptimized
            className="block size-full"
          />
        </div>
      )}
    </div>
  );
}
