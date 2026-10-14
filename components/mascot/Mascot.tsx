import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Figma: Mascot/연학이 (14:45).
 * Figma note — "연학이 마스코트. Pose 변형으로 화면 상황에 맞게 사용.
 * (교체 필요) 변형은 표정 일러스트가 아직 없어 자리만 잡아둔 상태."
 */
const POSES = {
  default: "/assets/mascot-default.png",
  greet: "/assets/mascot-greet.png",
  threeQuarter: "/assets/mascot-three-quarter.png",
  reading: "/assets/mascot-reading.png",
  worried: "/assets/mascot-worried.png",
  sad: "/assets/mascot-sad.png",
  flying: "/assets/mascot-flying.png",
  happy: "/assets/mascot-happy.png",
  celebrate: "/assets/mascot-celebrate.png",
  surprised: "/assets/mascot-surprised.png",
  tablet: "/assets/mascot-tablet.png",
} as const;

export type MascotPose = keyof typeof POSES;

export function Mascot({
  pose = "default",
  width = 244,
  height = 280,
  className,
  style,
}: {
  pose?: MascotPose;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("relative shrink-0 overflow-clip", className)}
      style={{ width, height, ...style }}
    >
      <Image
        src={POSES[pose]}
        alt="연학이"
        fill
        sizes="244px"
        className="pointer-events-none object-cover"
      />
    </div>
  );
}
