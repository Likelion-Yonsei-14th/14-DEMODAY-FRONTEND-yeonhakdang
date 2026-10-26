import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Figma: Toast (16:208) — dark pill with a check glyph. */
export function Toast({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex max-w-[345px] items-center gap-[8px] rounded-full bg-text-primary py-[12px] pl-[16px] pr-[20px]",
        className,
      )}
    >
      <Icon name="icon-check-toast" size={20} />
      <p className="relative min-w-0 truncate font-bold text-body-m-14 text-text-inverse">
        {text}
      </p>
    </div>
  );
}
