import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Figma: Mascot/Face Badge — size=S (14:46) | M (14:48) | L (14:50).
 * The face fill is cropped to bleed slightly past the ring (negative side and
 * bottom insets) so 연학이's head fills the circle.
 */
export function MascotFaceBadge({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-clip rounded-full border-2 border-brand-secondary-light bg-bg-base",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <div className="absolute bottom-[-16%] left-[-5%] right-[-5%] top-[2%]">
        <Image
          src="/assets/mascot-face.png"
          alt=""
          fill
          sizes="96px"
          className="pointer-events-none object-cover"
        />
      </div>
    </div>
  );
}
