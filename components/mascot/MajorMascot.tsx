import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Figma: Mascot/학과 컨셉 (79:57).
 * Figma note — "학과 추천 결과에 따라 바뀌는 연학이 이미지. 새 학과 이미지가
 * 생기면 같은 형태로 학과 variant를 추가하고 인스턴스의 '학과' 속성만 바꾸면
 * 됨. 현재 학과 이미지를 교체할 땐 이 variant의 이미지 fill만 바꾸면 모든
 * 화면·공유카드에 반영."
 */
const MAJORS = {
  경영학과: "/assets/mascot-major-business.png",
} as const;

export type MajorKey = keyof typeof MAJORS;

export function MajorMascot({
  major = "경영학과",
  width = 244,
  height = 237,
  className,
  style,
}: {
  major?: MajorKey;
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
        src={MAJORS[major]}
        alt=""
        fill
        sizes="244px"
        className="pointer-events-none object-cover"
      />
    </div>
  );
}
