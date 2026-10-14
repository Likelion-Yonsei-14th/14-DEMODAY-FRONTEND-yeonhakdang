import { extendTailwindMerge } from "tailwind-merge";

/**
 * The Figma text styles are registered as Tailwind `--text-*` theme entries,
 * so `text-body-m-14` is a font size while `text-text-secondary` is a colour.
 * tailwind-merge cannot tell them apart on its own and would drop the type
 * style, so both scales are declared here.
 */
const TEXT_STYLES = [
  "display-32",
  "score-48",
  "score-28",
  "h1-26",
  "h2-22",
  "h3-18",
  "label-button-17",
  "label-button-15",
  "body-l-16",
  "body-l-input-16",
  "body-m-14",
  "caption-12",
  "caption-11",
  "overline-12",
] as const;

const COLORS = [
  "bg-base",
  "bg-subtle",
  "surface-default",
  "text-primary",
  "text-secondary",
  "text-tertiary",
  "text-inverse",
  "brand-primary",
  "brand-secondary",
  "brand-secondary-light",
  "brand-secondary-tint",
  "brand-secondary-dark",
  "brand-accent",
  "brand-accent-tint",
  "brand-primary-tint",
  "line-default",
  "line-strong",
  "system-kakao",
  "system-kakao-text",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...TEXT_STYLES],
      color: [...COLORS],
      shadow: ["card", "sheet"],
    },
  },
});

/**
 * Joins class names and resolves Tailwind conflicts, so a screen can override
 * a component's own utilities (most importantly `relative` → `absolute`,
 * which CSS source order would otherwise decide).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return twMerge(parts.filter(Boolean).join(" "));
}
