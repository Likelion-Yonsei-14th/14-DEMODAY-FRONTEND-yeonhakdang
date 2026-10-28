"use client";

import Image from "next/image";

import { DOCKED, Docked } from "@/components/layout/Screen";
import { Mascot, type MascotPose } from "@/components/mascot/Mascot";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { SINGLES_TOTAL } from "@/lib/catalog";
import {
  PACKAGE_PRICE,
  orderPrice,
  purchaseSteps,
  useProto,
  won,
  type ProductKind,
} from "@/lib/proto";

/**
 * Figma: Pattern/Mascot Stage (73:2852 · 74:2702) — 150px disc holding a pose.
 * Each pose is cropped differently inside the disc, so the inner box comes
 * from the frame rather than being derived.
 */
export function MascotStage({
  pose,
  inner,
  innerClassName,
  className,
}: {
  pose: MascotPose;
  inner: { left: number; top: number; width: number; height: number };
  innerClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative size-[150px] shrink-0 overflow-clip rounded-full bg-bg-base",
        className,
      )}
    >
      <Mascot
        pose={pose}
        className={cn("absolute", innerClassName)}
        width={inner.width}
        height={inner.height}
        style={{ left: inner.left, top: inner.top }}
      />
    </div>
  );
}

/**
 * Figma: hero (e.g. 29:1232) — the navy product masthead that the status bar
 * and a white-glyph top bar sit on top of.
 */
export function ProductHero({
  height,
  badge,
  title,
  subtitle,
  pose,
  poseInner,
  poseInnerClassName,
  sparkles,
  className,
}: {
  height: number;
  badge: string;
  title: string;
  subtitle: string;
  pose: MascotPose;
  poseInner: { left: number; top: number; width: number; height: number };
  poseInnerClassName?: string;
  /** Decorative ✦ glyphs, positioned per frame. */
  sparkles: Array<{ left: number; top: number; size: number }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-clip bg-brand-secondary",
        className,
      )}
      style={{ height }}
    >
      <div className="absolute left-[170px] top-[-40px] size-[360px]">
        <Image src="/assets/product-hero-ring.svg" alt="" width={360} height={360} unoptimized className="block" />
      </div>
      <div className="absolute left-[204px] top-[-4px] size-[280px] opacity-50">
        <Image src="/assets/hero-halo.png" alt="" width={280} height={280} loading="eager" className="block size-full" />
      </div>

      <MascotStage
        pose={pose}
        inner={poseInner}
        innerClassName={poseInnerClassName}
        className="absolute left-[219px] top-[66px]"
      />

      <div className="absolute left-[24px] top-[223px] flex flex-col items-start gap-[12px]">
        <Chip type="gold" label={badge} />
        <div>
          <h1 className="whitespace-pre-line font-serif text-h1-26 text-text-inverse">
            {title}
          </h1>
          <p className="whitespace-nowrap text-body-m-14 text-brand-accent-tint">
            {subtitle}
          </p>
        </div>
      </div>

      {sparkles.map(({ left, top, size }) => (
        <p
          key={`${left}-${top}`}
          className="absolute whitespace-nowrap leading-[26px] text-brand-accent"
          style={{ left, top, fontSize: size }}
        >
          ✦
        </p>
      ))}
    </div>
  );
}

/** Figma: Pattern/Badge/Icon — 44px tinted square (73:2221 · 73:2231). */
export function FeatureBadge({ icon }: { icon: string }) {
  return (
    <div className="relative flex size-[44px] shrink-0 items-center justify-center overflow-clip rounded-[14px] bg-brand-secondary-tint">
      <Icon name={icon} size={22} />
    </div>
  );
}

/** Figma: "이런 걸 알려줘요" rows (e.g. 29:1267) — badge + title + caption. */
export function FeatureRow({
  icon,
  title,
  caption,
  width = 350,
}: {
  icon: string;
  title: string;
  caption: string;
  width?: number;
}) {
  return (
    <div
      className="relative flex shrink-0 items-center gap-[14px] overflow-clip"
      style={{ width }}
    >
      <FeatureBadge icon={icon} />
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip">
        <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
          {title}
        </p>
        <p className="relative w-full shrink-0 whitespace-pre-line text-caption-12 text-text-secondary">
          {caption}
        </p>
      </div>
    </div>
  );
}

export function FeatureList({
  title = "이런 걸 알려줘요",
  rows,
  className,
}: {
  title?: string;
  rows: Array<{ icon: string; title: string; caption: string; width?: number }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[14px] overflow-clip",
        className,
      )}
    >
      <SectionTitle title={title} className="w-auto" />
      {rows.map((row) => (
        <FeatureRow key={row.title} {...row} />
      ))}
    </div>
  );
}

/** Figma: Pattern/Product/Example Score Row (75:3154). */
export function ExampleScoreRow({ label, score }: { label: string; score: string }) {
  return (
    <div className="relative flex w-[305px] shrink-0 items-center gap-[10px] overflow-clip py-[10px]">
      <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
        {label}
      </p>
      <div className="relative h-px min-w-px flex-1" />
      <p className="relative shrink-0 whitespace-nowrap text-h3-18 text-brand-secondary">
        {score}
      </p>
    </div>
  );
}

/** Figma: Pattern/Product/Lock Notice (73:2654). */
export function LockNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-[6px] overflow-clip rounded-full bg-text-primary py-[8px] pl-[12px] pr-[14px]",
        className,
      )}
    >
      <Icon name="product-icon-lock" size={16} />
      <p className="relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px] text-text-inverse">
        구매하면 전체 결과가 열려요
      </p>
    </div>
  );
}

/** Figma: Option/Product (17:250 selected · 17:261 default) — radio option row. */
export function OptionProduct({
  title,
  description,
  price,
  original,
  badge,
  selected = false,
  onPress,
}: {
  title: string;
  description: string;
  price: string;
  original?: string;
  badge?: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-full shrink-0 items-center gap-[12px] rounded-[16px] p-[16px] transition-colors",
        selected
          ? "border-2 border-brand-secondary bg-brand-secondary-tint"
          : "border border-line-default bg-surface-default",
      )}
    >
      <Icon name={selected ? "product-radio-on" : "product-radio-off"} size={22} />
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip">
        <div className="relative flex shrink-0 items-center gap-[6px] overflow-clip">
          <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
            {title}
          </p>
          {badge && (
            <div className="relative flex shrink-0 items-start overflow-clip rounded-full bg-brand-primary px-[8px] py-[2px]">
              <p className="relative shrink-0 whitespace-nowrap font-medium text-caption-11 text-text-inverse">
                {badge}
              </p>
            </div>
          )}
        </div>
        <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-secondary">
          {description}
        </p>
      </div>
      <div className="relative flex shrink-0 flex-col items-end overflow-clip whitespace-nowrap">
        {original && (
          <p className="relative shrink-0 text-caption-12 text-text-tertiary">
            {original}
          </p>
        )}
        <p
          className={cn(
            "relative shrink-0 font-bold text-body-l-16",
            selected ? "text-brand-secondary" : "text-text-primary",
          )}
        >
          {price}
        </p>
      </div>
    </Tap>
  );
}

/** Figma: Pattern/Product/Purchase Options (74:3520). */
export function PurchaseOptions({
  caption,
  single,
  className,
}: {
  caption: string;
  single: { title: string; description: string; price: string };
  className?: string;
}) {
  const { state, update } = useProto();
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[10px] overflow-clip",
        className,
      )}
    >
      <SectionTitle title="구매 옵션" caption={caption} />
      <OptionProduct
        {...single}
        selected={state.plan === "single"}
        onPress={() => update({ plan: "single" })}
      />
      <OptionProduct
        title="3종 패키지"
        description="합격 궁합 + 귀인 + 부적"
        price={won(PACKAGE_PRICE)}
        original={won(SINGLES_TOTAL)}
        badge="35% 할인"
        selected={state.plan === "package"}
        onPress={() => update({ plan: "package" })}
      />
    </div>
  );
}

/** Figma: Pattern/Product/Notice Box (74:3262). */
export function ProductNoticeBox({ className }: { className?: string }) {
  const proto = useProto();
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[6px] overflow-clip rounded-[12px] bg-bg-subtle px-[16px] py-[14px] text-[12px] leading-[18px]",
        className,
      )}
    >
      <p className="relative shrink-0 whitespace-nowrap font-bold text-text-secondary">
        구매 전 확인해 주세요
      </p>
      {[
        ["서비스 제공기간", "결제 즉시(약 1분 내) 생성돼요. 보관함에서 회원 탈퇴 전까지 언제든 다시 볼 수 있어요."],
        ["취소", "결과를 열어보기 전이라면 결제일부터 7일 이내 전액 취소·환불돼요."],
        ["환불", "결과를 연 뒤에는 디지털 콘텐츠 특성상 단순 변심 환불이 제한돼요(전자상거래법 제17조 제2항 제5호). 3종 패키지는 열지 않은 상품만큼 부분 환불돼요."],
        ["교환", "디지털 콘텐츠라 교환은 없어요. 열기 전 입력 정보가 잘못됐다면 환불 후 다시 구매할 수 있어요."],
      ].map(([label, description]) => (
        <p key={label} className="relative w-full shrink-0 whitespace-pre-wrap text-text-tertiary">
          · <strong>{label}</strong>{"  "}{description}
        </p>
      ))}
      <p className="relative w-full shrink-0 text-text-tertiary">
        · 사주 결과는 참고용 콘텐츠이며 합격을 보장하지 않아요.
      </p>
      <Tap onPress={() => proto.go("10-1")} className="w-full font-bold text-brand-secondary">
        환불 정책 전체 보기 ›
      </Tap>
    </div>
  );
}

/** Figma: Pattern/Bottom CTA — 가격 + 결제 variant (74:2533). */
export function PriceBottomCta({
  product,
  className,
}: {
  product: ProductKind;
  className?: string;
}) {
  const proto = useProto();
  const { plan } = proto.state;
  const price = won(orderPrice({ product, plan }));
  return (
    <Docked>
      {(docked) => (
        <div
          className={cn(
            "relative flex w-full shrink-0 items-center gap-[12px] overflow-clip border-t border-line-default bg-surface-default px-[24px] py-[12px]",
            className,
            docked && DOCKED,
          )}
        >
          <div className="relative flex shrink-0 flex-col items-start overflow-clip whitespace-nowrap">
            <p className="relative shrink-0 font-medium text-caption-11 text-text-tertiary">
              선택한 상품
            </p>
            <p className="relative shrink-0 text-h3-18">{price}</p>
          </div>
          <Button
            label="확인하러 가기"
            onPress={() => {
              proto.update({ product });
              proto.go(purchaseSteps({ product, plan })[0]);
            }}
            className="min-w-px flex-1"
          />
        </div>
      )}
    </Docked>
  );
}
