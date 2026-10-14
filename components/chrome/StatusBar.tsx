"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/**
 * Figma: StatusBar — theme=Dark (16:13, dark glyphs) | Light (16:24, white).
 * In the prototype, three taps here open the hidden demo panel.
 */
export function StatusBar({
  className,
  theme = "dark",
  time = "9:41",
}: {
  className?: string;
  theme?: "dark" | "light";
  time?: string;
}) {
  const { openDemo } = useProto();
  const isLight = theme === "light";
  return (
    <div onClick={openDemo} className={cn("relative h-[54px] w-full shrink-0", className)}>
      <p
        className={cn(
          "absolute left-[48px] top-[17px] whitespace-nowrap font-bold text-body-l-16",
          isLight && "text-text-inverse",
        )}
      >
        {time}
      </p>
      <div className="absolute right-[30px] top-[21px] h-[14px] w-[78px]">
        <Image
          src={
            isLight
              ? "/assets/status-indicators-light.svg"
              : "/assets/status-indicators.svg"
          }
          alt=""
          width={78}
          height={14}
          unoptimized
          className="block size-full"
        />
      </div>
    </div>
  );
}
