import { cn } from "@/lib/cn";
import type { CharmResult } from "@/lib/saju";

/** The art is drawn at the app's 393×852 and saved at 3× — 1179×2556, an iPhone lock screen. */
export const CHARM_WIDTH = 393;
export const CHARM_HEIGHT = 852;

/** Each 다시 뽑기 swaps the ornament on the card's dividers and seal. */
const ORNAMENTS = ["✦", "❖", "✧", "◈"];

function Divider({ ink, ornament }: { ink: string; ornament: string }) {
  return (
    <div className="flex w-[205px] items-center gap-[8px]" style={{ color: ink }}>
      <span className="size-[7px] rounded-full" style={{ background: ink }} />
      <span className="h-[2px] flex-1" style={{ background: ink }} />
      <span className="text-[30px] leading-none">{ornament}</span>
      <span className="h-[2px] flex-1" style={{ background: ink }} />
      <span className="size-[7px] rounded-full" style={{ background: ink }} />
    </div>
  );
}

/** One corner bracket of the inner frame, mirrored per corner. */
function Corner({ ink, className }: { ink: string; className: string }) {
  return (
    <span
      className={cn("absolute size-[22px] border-[3px]", className)}
      style={{ borderColor: ink }}
    />
  );
}

/**
 * 8-3 부적: a talisman card on the colour of the element it fills — the
 * charm-poster-2 look, drawn from the result so every person and every
 * 다시 뽑기 gets its own. The top stays clear for the lock-screen clock.
 */
export function CharmArt({ art, className, style }: { art: CharmResult["art"]; className?: string; style?: React.CSSProperties }) {
  const ornament = ORNAMENTS[art.variant % ORNAMENTS.length];
  const [first, second] = [...art.word];
  return (
    <div
      className={cn("relative overflow-hidden font-serif", className)}
      style={{ width: CHARM_WIDTH, height: CHARM_HEIGHT, background: art.bg, ...style }}
    >
      {/* soft light from above, darker toward the edges */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 70% at 50% 40%, rgba(255,255,255,0.10), rgba(0,0,0,0.35))" }}
      />
      {/* the variant's ornaments scattered on the background */}
      {[
        [42, 96, 18],
        [338, 150, 14],
        [30, 760, 16],
        [346, 720, 20],
        [190, 806, 12],
      ].map(([left, top, size]) => (
        <span
          key={`${left}-${top}`}
          className="absolute leading-none opacity-70"
          style={{ left, top, fontSize: size, color: art.accent }}
        >
          {ornament}
        </span>
      ))}

      {/* the card */}
      <div
        className="absolute left-[62px] top-[176px] h-[560px] w-[269px] rounded-[26px] p-[12px]"
        style={{ background: art.ink }}
      >
        <div className="relative size-full rounded-[16px]" style={{ background: art.paper }}>
          <div className="absolute inset-[12px] border-[2px]" style={{ borderColor: art.ink }} />
          <Corner ink={art.ink} className="left-[18px] top-[18px] border-b-0 border-r-0" />
          <Corner ink={art.ink} className="right-[18px] top-[18px] border-b-0 border-l-0" />
          <Corner ink={art.ink} className="bottom-[18px] left-[18px] border-r-0 border-t-0" />
          <Corner ink={art.ink} className="bottom-[18px] right-[18px] border-l-0 border-t-0" />

          <div className="absolute inset-x-0 top-[44px] flex flex-col items-center gap-[18px]" style={{ color: art.ink }}>
            <p className="text-[20px] font-bold leading-none tracking-[0.3em]">{art.formula}</p>
            <Divider ink={art.ink} ornament={ornament} />
            <p className="text-[104px] font-black leading-[1.05]">{first}</p>
            <p className="text-[104px] font-black leading-[1.05]">{second}</p>
          </div>

          <div className="absolute inset-x-0 bottom-[40px] flex flex-col items-center gap-[10px]" style={{ color: art.ink }}>
            <div
              className="flex size-[78px] items-center justify-center rounded-full border-[5px]"
              style={{ borderColor: art.ink, boxShadow: `inset 0 0 0 4px ${art.paper}, inset 0 0 0 5px ${art.accent}` }}
            >
              <span className="text-[32px] font-black leading-none">{art.formula.at(-1)}</span>
            </div>
            <p className="text-[16px] font-bold leading-none tracking-[0.4em]">{art.pillar}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
