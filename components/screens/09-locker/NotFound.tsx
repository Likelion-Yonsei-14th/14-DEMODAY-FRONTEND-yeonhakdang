"use client";

import { HomeIndicator } from "@/components/chrome/HomeIndicator";
import { StatusBar } from "@/components/chrome/StatusBar";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { Button } from "@/components/ui/Button";
import { useProto } from "@/lib/proto";

/** Figma: 9-3 404 · 페이지 없음 (C-06) (34:1873) */
const SPARKLES = [
  { left: 70, top: 300, size: 18 },
  { left: 320, top: 290, size: 12 },
  { left: 300, top: 450, size: 16 },
] as const;

export function NotFound() {
  const proto = useProto();
  return (
    <Screen>
      <StatusBar className="absolute left-0 top-0" />
      <TopBar type="logo" right="icon-menu" className="absolute left-0 top-[54px]" />

      {/* A one-off display numeral (34:1893): Noto Serif KR Black 96/56. */}
      <p className="absolute left-[110px] top-[140px] whitespace-nowrap font-serif text-[96px] font-black leading-[56px] tracking-[-1.92px] text-brand-secondary">
        404
      </p>

      <Mascot
        pose="flying"
        className="absolute left-[96.5px] top-[276px]"
        width={200}
        height={189.723}
      />

      {SPARKLES.map(({ left, top, size }) => (
        <p
          key={`${left}-${top}`}
          className="absolute whitespace-nowrap leading-[26px] text-brand-accent"
          style={{ left, top, fontSize: size }}
        >
          ✦
        </p>
      ))}

      <p className="absolute left-[104px] top-[494px] whitespace-nowrap font-serif text-h2-22">
        길을 잃은 것 같아요
      </p>
      <div className="absolute left-[24px] top-[532px] w-[345px] whitespace-pre-line text-center text-body-m-14 text-text-secondary">
        {"주소가 바뀌었거나 사라진 페이지예요.\n연학이가 첫 화면으로 데려다줄게요."}
      </div>

      <Button
        label="첫 화면으로 가기"
        onPress={() => proto.reset("1-1")}
        className="absolute left-[24px] top-[718px] w-[345px]"
      />
      <HomeIndicator className="absolute left-0 top-[818px]" />
    </Screen>
  );
}
