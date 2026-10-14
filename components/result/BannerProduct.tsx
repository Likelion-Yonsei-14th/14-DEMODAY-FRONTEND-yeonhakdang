import Image from "next/image";

import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";

/** Figma: Banner/Product — 합격 궁합 (17:219) | 귀인 (17:229) | 부적 (17:239). */
export type ProductKind = "compat" | "benefactor" | "charm";

const THUMBS: Record<ProductKind, string> = {
  compat: "/assets/mascot-flying.png",
  benefactor: "/assets/mascot-reading.png",
  charm: "/assets/thumb-charm.png",
};

export const PRODUCT_BANNERS: Array<{
  product: ProductKind;
  title: string;
  sub: string;
  price: string;
}> = [
  {
    product: "compat",
    title: "지원한 대학과 나, 합격 궁합은?",
    sub: "대학별 궁합 점수 + 월별 합격 기운",
    price: "2,900원",
  },
  {
    product: "benefactor",
    title: "대학에서 만날 나의 귀인은?",
    sub: "관계별 잘 맞는 사람 유형 + 만날 시기",
    price: "1,900원",
  },
  {
    product: "charm",
    title: "합격 기운 배경화면 부적",
    sub: "내 오행 색·문양으로 그린 고화질 부적",
    price: "990원",
  },
];

export function BannerProduct({
  product,
  title,
  sub,
  price,
  onPress,
  className,
}: {
  product: ProductKind;
  title: string;
  sub: string;
  price: string;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-full shrink-0 items-center gap-[12px] rounded-[16px] border border-line-default bg-surface-default py-[12px] pl-[12px] pr-[14px] drop-shadow-[0_4px_8px_rgba(22,26,35,0.06)]",
        className,
      )}
    >
      <div className="relative size-[64px] shrink-0 overflow-clip rounded-[14px] bg-bg-base">
        <Image
          src={THUMBS[product]}
          alt=""
          width={76}
          height={78}
          className="pointer-events-none absolute left-[-6px] top-[-4px] max-w-none object-cover"
        />
      </div>
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip">
        <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
          {title}
        </p>
        <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-secondary">
          {sub}
        </p>
        <div className="relative flex shrink-0 items-center overflow-clip">
          <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14 text-brand-primary">
            {price}
          </p>
        </div>
      </div>
      <Icon name="icon-chevron-right" size={20} />
    </Tap>
  );
}
