"use client";

import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

export const SCREEN_WIDTH = 393;
export const SCREEN_HEIGHT = 852;

/**
 * In the prototype a tall frame scrolls inside the 852px device, and the
 * chrome Figma draws at the very bottom of the frame (bottom nav, price CTA)
 * is lifted into this dock so it stays pinned.
 */
const DockContext = createContext<HTMLElement | null>(null);

/**
 * Renders `node` into the device dock when there is one, with its
 * frame-absolute position neutralised; otherwise renders it in place.
 */
export function Docked({
  children,
}: {
  children: (docked: boolean) => React.ReactElement;
}) {
  const dock = useContext(DockContext);
  return dock ? createPortal(children(true), dock) : children(false);
}

/** Classes that turn a frame-absolute bottom bar into a dock row. */
export const DOCKED = "relative left-auto top-auto";

/**
 * A single Figma artboard rendered as a device surface (393×852).
 * Screens compose as a vertical stack: StatusBar → TopBar → content →
 * [BottomCta] → HomeIndicator, matching how the frames are built in Figma.
 */
export function Screen({
  children,
  className,
  height = SCREEN_HEIGHT,
}: {
  children: React.ReactNode;
  className?: string;
  height?: number;
}) {
  const { active } = useProto();
  const [dock, setDock] = useState<HTMLDivElement | null>(null);

  if (active && height > SCREEN_HEIGHT) {
    return (
      <div
        className={cn(
          "relative flex w-[393px] shrink-0 flex-col overflow-hidden bg-bg-base",
          className,
        )}
        style={{ height: SCREEN_HEIGHT }}
      >
        <div className="screen-scroll relative min-h-px flex-1">
          <div className="relative flex w-[393px] flex-col" style={{ height }}>
            <DockContext.Provider value={dock}>{children}</DockContext.Provider>
          </div>
        </div>
        <div ref={setDock} className="absolute bottom-0 left-0 flex w-full flex-col" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex w-[393px] shrink-0 flex-col overflow-hidden bg-bg-base",
        className,
      )}
      style={{ height }}
    >
      {children}
    </div>
  );
}

/**
 * The scrollable region between the top chrome and the bottom chrome.
 * Figma represents long screens as one tall frame; here the overflow is
 * real so the whole design is reachable inside the 852px viewport.
 */
export function ScreenScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("screen-scroll relative min-h-px flex-1", className)}>
      {children}
    </div>
  );
}
