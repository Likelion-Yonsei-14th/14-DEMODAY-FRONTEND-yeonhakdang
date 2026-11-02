"use client";

import { useState } from "react";

import { verifyUnlockCode } from "@/app/actions/unlock";
import { BottomSheetHeader, Dim } from "@/components/layout/BottomSheet";
import { Overlay } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { HintText } from "@/components/ui/HintText";
import { TextField } from "@/components/ui/TextField";
import { trackUnlock } from "@/lib/analytics";
import { useProto } from "@/lib/proto";
import { MAX_CODE_LENGTH, normalizeCode } from "@/lib/unlock";

/**
 * 7-3 "이용권 코드가 있어요": the server checks the code (UNLOCK_CODES), and a
 * right one opens all three paid results on this device — no login, no order.
 */
export function UnlockSheet({ onClose }: { onClose: () => void }) {
  const proto = useProto();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    setChecking(true);
    setError(undefined);
    try {
      const ok = await verifyUnlockCode(code);
      trackUnlock(ok);
      if (!ok) return setError("코드가 맞지 않아요. 다시 확인해 주세요");
      proto.update({ unlockCode: normalizeCode(code), charmRerolls: 3 });
      proto.replace("7-4");
    } catch {
      setError("확인하지 못했어요. 잠시 후 다시 시도해 주세요");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Overlay>
      <Dim onPress={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="이용권 코드"
        onKeyDown={(event) => event.key === "Escape" && onClose()}
        className="proto-sheet-in absolute bottom-0 left-0 flex w-full flex-col items-center rounded-t-[24px] bg-surface-default pb-[34px] shadow-sheet"
      >
        <BottomSheetHeader title="이용권 코드" onClose={onClose} />
        <form
          className="flex w-full flex-col gap-[16px] px-[24px] pt-[4px]"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim() && !checking) void submit();
          }}
        >
          <HintText
            title="받은 코드를 입력해 주세요"
            caption="합격 궁합 · 귀인 · 부적이 이 기기에서 모두 열려요"
          />
          <TextField
            value={code}
            placeholder="예: YHD-2026-XXXX"
            maxLength={MAX_CODE_LENGTH}
            error={error}
            onChange={(value) => {
              setCode(value);
              setError(undefined);
            }}
          />
          <Button
            label={checking ? "확인하고 있어요…" : "코드로 열기"}
            disabled={!code.trim() || checking}
            onPress={() => void submit()}
          />
        </form>
      </div>
    </Overlay>
  );
}
