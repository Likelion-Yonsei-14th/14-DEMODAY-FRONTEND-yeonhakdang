"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

export const SCREEN_WIDTH = 393;
export const SCREEN_HEIGHT = 852;
/** The Figma frames reserve this much for the iOS status bar at the top… */
const STATUS_BAR = 54;
/** …and this much for the home indicator at the bottom. */
const HOME_INDICATOR = 34;

/**
 * The app's visible area in design px (393 wide). The app shell provides it;
 * without it a screen renders as its fixed-size Figma frame.
 */
export type Viewport = {
  height: number;
  /** iPhone notch / home bar insets, in design px. */
  safeTop: number;
  safeBottom: number;
};

export const ViewportContext = createContext<Viewport | null>(null);

type Slots = {
  /** Bottom chrome that stays pinned: Bottom groups, then Docked bars. */
  group: HTMLElement | null;
  chrome: HTMLElement | null;
  /** Full-viewport layer above everything: dims, sheets, drawers. */
  overlay: HTMLElement | null;
  /** The design y where the pinned bottom group starts. */
  setDockFrom: (y: number | undefined) => void;
};

const SlotsContext = createContext<Slots | null>(null);

/**
 * Renders a bottom bar (nav, price CTA) pinned to the bottom of the app, with
 * its frame-absolute position neutralised; otherwise renders it in place.
 */
export function Docked({
  children,
}: {
  children: (docked: boolean) => React.ReactElement;
}) {
  const slots = useContext(SlotsContext);
  return slots?.chrome ? createPortal(children(true), slots.chrome) : children(false);
}

/** Classes that turn a frame-absolute bottom bar into a dock row. */
export const DOCKED = "relative left-auto top-auto";

/**
 * The frame's bottom group (CTA buttons and the caption under them), pinned
 * to the bottom of the app. Children keep their frame coordinates: `from` is
 * the design y where the group starts, `to` where it ends (above a nav bar,
 * or the home indicator by default).
 */
export function Bottom({
  from,
  to = SCREEN_HEIGHT - HOME_INDICATOR,
  children,
}: {
  from: number;
  to?: number;
  children: React.ReactNode;
}) {
  const slots = useContext(SlotsContext);
  const setDockFrom = slots?.setDockFrom;
  useLayoutEffect(() => {
    setDockFrom?.(from);
    return () => setDockFrom?.(undefined);
  }, [from, setDockFrom]);

  if (!slots?.group) return <>{children}</>;
  return createPortal(
    <div className="relative w-[393px] overflow-hidden" style={{ height: to - from }}>
      <div className="absolute left-0 w-[393px]" style={{ top: -from, height: to }}>
        {children}
      </div>
    </div>,
    slots.group,
  );
}

/** Dims, sheets and drawers: laid over the whole app, not just the frame. */
export function Overlay({ children }: { children: React.ReactNode }) {
  const slots = useContext(SlotsContext);
  return slots?.overlay ? createPortal(children, slots.overlay) : <>{children}</>;
}

/**
 * Inside an Overlay: a bottom sheet (and whatever peeks over it) anchored to
 * the bottom of the app. `from` is the design y of its topmost part.
 */
export function Anchored({ from, children }: { from: number; children: React.ReactNode }) {
  const slots = useContext(SlotsContext);
  if (!slots) return <>{children}</>;
  return (
    <div
      className="screen-anchor absolute bottom-0 left-0 w-[393px]"
      style={{ height: SCREEN_HEIGHT - from }}
    >
      <div
        className="absolute left-0 w-[393px]"
        style={{ top: -from, height: SCREEN_HEIGHT }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A single Figma artboard rendered as an app screen. In the app shell the
 * status-bar strip gives way to the notch inset, the bottom group and bars
 * pin to the bottom, and whatever doesn't fit in between scrolls.
 *
 * `bleed`: the frame's first block (a hero) runs under the status bar, so it
 * starts at the very top instead of below the status-bar strip.
 * `fit`: the frame scrolls on its own (ScreenScroll), so it fills exactly the
 * space between the top and the pinned bottom.
 */
export function Screen({
  children,
  className,
  height = SCREEN_HEIGHT,
  bleed = false,
  fit = false,
}: {
  children: React.ReactNode;
  className?: string;
  height?: number;
  bleed?: boolean;
  fit?: boolean;
}) {
  const { active } = useProto();
  const viewport = useContext(ViewportContext);
  const [group, setGroup] = useState<HTMLDivElement | null>(null);
  const [chrome, setChrome] = useState<HTMLDivElement | null>(null);
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const [dock, setDock] = useState<HTMLDivElement | null>(null);
  const [dockFrom, setDockFrom] = useState<number>();
  const [dockHeight, setDockHeight] = useState(0);

  useLayoutEffect(() => {
    if (!dock) return;
    const measure = () => setDockHeight(dock.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => observer.disconnect();
  }, [dock]);

  if (!active || !viewport) {
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

  const { safeTop, safeBottom } = viewport;
  const tall = height > SCREEN_HEIGHT;
  // Shift the frame up past the status-bar strip, down past the notch.
  const offset = safeTop - STATUS_BAR;
  const frameHeight = fit
    ? viewport.height - dockHeight - offset
    : tall
      ? height - HOME_INDICATOR
      : (dockFrom ?? SCREEN_HEIGHT - HOME_INDICATOR);

  const frame: CSSProperties = {
    height: frameHeight,
    marginTop: offset,
    paddingTop: bleed ? 0 : STATUS_BAR,
  };

  return (
    <div
      className={cn("relative w-[393px] overflow-hidden bg-bg-base", className)}
      style={{ height: viewport.height }}
    >
      <div
        className="screen-scroll absolute inset-0"
        // A tall frame already leaves room for its bars at the bottom.
        style={{ paddingBottom: tall ? 0 : dockHeight }}
      >
        <div className="relative flex w-[393px] flex-col overflow-hidden" style={frame}>
          <SlotsContext.Provider value={{ group, chrome, overlay, setDockFrom }}>
            {children}
          </SlotsContext.Provider>
        </div>
      </div>
      <div
        ref={setDock}
        className="screen-dock absolute bottom-0 left-0 flex w-full flex-col bg-inherit"
        style={{ paddingBottom: safeBottom }}
      >
        <div ref={setGroup} className="flex w-full flex-col empty:hidden" />
        <div ref={setChrome} className="flex w-full flex-col empty:hidden" />
      </div>
      <div ref={setOverlay} className="screen-overlay absolute inset-0" />
    </div>
  );
}

/**
 * The scrollable region between the top chrome and the bottom chrome.
 * Figma represents long screens as one tall frame; here the overflow is
 * real so the whole design is reachable inside the screen.
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
