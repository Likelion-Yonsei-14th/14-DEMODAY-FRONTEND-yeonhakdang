"use client";

import { useEffect, useRef, useState } from "react";

import { BottomSheetHeader } from "@/components/layout/BottomSheet";
import { Button } from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import {
  REFUND_REASONS,
  errorMessage,
  getRefund,
  requestRefund,
  type Refund,
  type RefundReason,
} from "@/lib/backend";
import { cn } from "@/lib/cn";
import { won } from "@/lib/proto";

const REFUND_STATUS: Record<string, string> = {
  REQUESTED: "신청 접수",
  PROCESSING: "처리 중",
  UNKNOWN: "결제사 확인 중",
  SUCCEEDED: "환불 완료",
  REJECTED: "환불 불가",
};

/**
 * 환불 신청 with the backend on. The server works out the amount from the
 * refund policy; the visitor only picks a reason. An open request is shown
 * instead of a new form, and asking again returns the same request.
 */
export function RefundApplyDialog({ orderId, title, onClose }: { orderId: string; title: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [refund, setRefund] = useState<Refund | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<RefundReason>("CHANGE_OF_MIND");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  useEffect(() => {
    getRefund(orderId)
      .then(setRefund, (error: unknown) => setMessage(errorMessage(error)))
      .finally(() => setLoading(false));
  }, [orderId]);

  const apply = async () => {
    setSending(true);
    setMessage("");
    try {
      setRefund(await requestRefund(orderId, reason));
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="refund-apply-title"
      onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed bottom-0 top-auto m-0 mx-auto max-h-[90dvh] w-full max-w-[393px] overflow-y-auto rounded-t-[24px] bg-surface-default p-0 text-text-primary shadow-sheet backdrop:bg-[#161a23]/55"
    >
      <div className="pb-[24px]">
        <BottomSheetHeader title="환불 신청" onClose={onClose} />
        <div className="flex flex-col gap-[16px] px-[24px] pt-[12px]">
          <h2 id="refund-apply-title" className="font-bold text-body-l-16">{title}</h2>
          {loading ? (
            <p role="status" className="text-caption-12 text-text-secondary">신청 내역을 확인하고 있어요…</p>
          ) : refund ? (
            <div className="flex flex-col gap-[8px] rounded-[12px] bg-brand-secondary-tint p-[16px]">
              <p className="font-bold text-body-m-14 text-brand-secondary">{REFUND_STATUS[refund.status] ?? refund.status}</p>
              <p className="text-caption-12 text-text-secondary">사유: {REFUND_REASONS[refund.reason] ?? refund.reason}</p>
              <p className="text-caption-12 text-text-secondary">예상 환불액 {won(refund.amount)} · 확정 금액은 심사 후 안내돼요</p>
            </div>
          ) : (
            <>
              <InfoBox>환불 금액은 환불 정책에 따라 자동으로 계산돼요. 결과를 열어본 상품은 단순 변심 환불이 어려워요.</InfoBox>
              <fieldset className="flex flex-col gap-[8px]">
                <legend className="mb-[8px] font-bold text-body-m-14">환불 사유</legend>
                {(Object.keys(REFUND_REASONS) as RefundReason[]).map((key) => (
                  <label
                    key={key}
                    className={cn(
                      "flex items-center gap-[10px] rounded-[12px] border px-[14px] py-[12px] text-body-m-14",
                      reason === key ? "border-brand-secondary bg-brand-secondary-tint" : "border-line-default",
                    )}
                  >
                    <input type="radio" name="refund-reason" value={key} checked={reason === key} onChange={() => setReason(key)} className="accent-brand-secondary" />
                    {REFUND_REASONS[key]}
                  </label>
                ))}
              </fieldset>
              <Button label={sending ? "신청하고 있어요…" : "환불 신청하기"} size="M" disabled={sending} onPress={apply} />
            </>
          )}
          {message && <p role="status" className="text-caption-12 text-brand-secondary">{message}</p>}
        </div>
      </div>
    </dialog>
  );
}
