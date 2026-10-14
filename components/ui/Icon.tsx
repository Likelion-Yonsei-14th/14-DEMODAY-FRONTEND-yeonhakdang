import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Renders an icon exported from Figma. Icons ship as SVG files in
 * /public/assets with their stroke colour already baked in by the export,
 * so they are never re-coloured here.
 */
export function Icon({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("relative block shrink-0 overflow-clip", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/assets/${name}.svg`}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="block size-full"
      />
    </span>
  );
}
