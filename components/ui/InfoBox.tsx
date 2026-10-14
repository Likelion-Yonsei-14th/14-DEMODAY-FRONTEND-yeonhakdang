import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Figma: InfoBox — tone=Info (17:284) | Warning (17:288). */
export function InfoBox({
  children,
  tone = "info",
  className,
}: {
  children: React.ReactNode;
  tone?: "info" | "warning";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-start gap-[8px] rounded-[12px] px-[14px] py-[12px]",
        tone === "warning" ? "bg-brand-primary-tint" : "bg-brand-secondary-tint",
        className,
      )}
    >
      <Icon name={tone === "warning" ? "icon-alert" : "icon-info"} size={18} />
      <p className="relative min-w-px flex-1 text-caption-12">{children}</p>
    </div>
  );
}
