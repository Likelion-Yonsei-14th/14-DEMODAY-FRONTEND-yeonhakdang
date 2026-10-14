"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/**
 * Figma: TextField (15:87) — type=Input|Select, state=Default|Filled|Error.
 * In the prototype an `onChange` turns the field live: Input becomes a real
 * <input>, Select lays an invisible native <select> over the box so phones
 * open their own picker.
 */
export function TextField({
  label,
  value,
  placeholder,
  helper,
  error,
  type = "input",
  onChange,
  options,
  inputMode,
  maxLength,
  disabled = false,
  className,
}: {
  label?: string;
  /** Filled value — rendered in primary text. */
  value?: string;
  /** Empty-state text — rendered in tertiary text. */
  placeholder?: string;
  helper?: string;
  error?: string;
  type?: "input" | "select";
  onChange?: (value: string) => void;
  /** Choices for a live select. */
  options?: string[];
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}) {
  const { active } = useProto();
  const live = active && onChange && !disabled;

  return (
    <div
      className={cn("relative flex w-full flex-col items-start gap-[8px]", className)}
    >
      {label && (
        <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
          {label}
        </p>
      )}
      <div
        className={cn(
          "relative flex h-[52px] w-full shrink-0 items-center overflow-clip rounded-[12px] bg-surface-default px-[16px] transition-colors",
          type === "select" && "gap-[8px]",
          error
            ? "border-2 border-brand-primary"
            : "border border-line-default focus-within:border-[1.5px] focus-within:border-brand-secondary",
        )}
      >
        {live && type === "input" ? (
          <input
            value={value ?? ""}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={maxLength}
            onChange={(e) => onChange(e.target.value)}
            className="relative min-w-px flex-1 bg-transparent text-body-l-input-16 text-text-primary outline-none placeholder:text-text-tertiary"
          />
        ) : (
          <p
            className={cn(
              "relative min-w-px flex-1 text-body-l-input-16",
              value ? "text-text-primary" : "text-text-tertiary",
            )}
          >
            {value || placeholder}
          </p>
        )}
        {type === "select" && <Icon name="icon-chevron-down" />}
        {live && type === "select" && (
          <select
            aria-label={label}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
      {error ? (
        <p className="relative shrink-0 text-caption-12 text-brand-primary">{error}</p>
      ) : (
        helper && (
          <p className="relative shrink-0 text-caption-12 text-text-secondary">
            {helper}
          </p>
        )
      )}
    </div>
  );
}
