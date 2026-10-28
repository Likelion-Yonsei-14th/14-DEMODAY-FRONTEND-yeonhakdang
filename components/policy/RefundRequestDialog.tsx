"use client";

import { useEffect, useRef, useState } from "react";

import { BottomSheetHeader } from "@/components/layout/BottomSheet";
import { Button } from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { BUSINESS } from "@/lib/business";
import { useProto } from "@/lib/proto";

/** Drafts the request; the refund is filed once it is e-mailed to 고객센터. */
export function RefundRequestDialog({ onClose }: { onClose: () => void }) {
  const proto = useProto();
  const dialog = useRef<HTMLDialogElement>(null);
  const requestText = useRef<HTMLTextAreaElement>(null);
  const [name, setName] = useState(proto.state.name);
  const [reason, setReason] = useState("아직 열지 않은 귀인과 부적의 부분 환불을 요청합니다.");
  const [message, setMessage] = useState("");
  const summary = [
    "연학당 환불 요청",
    `카카오 계정 이름: ${name.trim() || "[이름을 입력해 주세요]"}`,
    "주문번호: HS-20261024-0118",
    "결제일: 2026.10.24",
    "상품: 3종 패키지 · 귀인 + 부적 부분 환불",
    "결제 수단: 카카오페이",
    "환불 요청 금액: 1,891원",
    `사유: ${reason.trim()}`,
  ].join("\n");

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  const copyRequest = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setMessage(`요청 내용을 복사했어요. ${BUSINESS.email}로 보내 주세요. 아직 환불이 접수된 것은 아니에요.`);
    } catch {
      requestText.current?.focus();
      requestText.current?.select();
      setMessage("자동 복사를 사용할 수 없어요. 선택된 요청 내용을 직접 복사해 주세요.");
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="refund-request-title"
      onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed bottom-0 top-auto m-0 mx-auto max-h-[90dvh] w-full max-w-[393px] overflow-y-auto rounded-t-[24px] bg-surface-default p-0 text-text-primary shadow-sheet backdrop:bg-[#161a23]/55"
    >
      <div className="pb-[24px]">
        <BottomSheetHeader title="환불 신청 안내" onClose={onClose} />
        <div className="flex flex-col gap-[16px] px-[24px] pt-[12px]">
          <h2 id="refund-request-title" className="font-bold text-body-l-16">귀인 + 부적 · 1,891원 부분 환불</h2>
          <InfoBox>아래 내용을 작성해 고객센터 <a href={`mailto:${BUSINESS.email}`} className="underline">{BUSINESS.email}</a>로 보내 주세요. 이메일을 보내야 환불 신청이 접수됩니다.</InfoBox>
          <label className="flex flex-col gap-[8px] font-bold text-body-m-14">
            카카오 계정 이름
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="이름을 입력해 주세요" className="w-full rounded-[12px] border border-line-default bg-bg-base p-[12px] font-normal outline-brand-secondary" />
          </label>
          <label className="flex flex-col gap-[8px] font-bold text-body-m-14">
            환불 사유
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="w-full resize-y rounded-[12px] border border-line-default bg-bg-base p-[12px] font-normal outline-brand-secondary [user-select:text] [-webkit-user-select:text]" />
          </label>
          <label className="flex flex-col gap-[8px] text-caption-12 text-text-secondary">
            고객센터에 전달할 내용
            <textarea ref={requestText} readOnly value={summary} rows={8} className="w-full resize-y rounded-[12px] border border-line-default p-[12px] text-text-primary outline-brand-secondary [user-select:text] [-webkit-user-select:text]" />
          </label>
          <Button label="환불 요청 내용 복사" size="M" type="outline" onPress={copyRequest} />
          <a href={`mailto:${BUSINESS.email}?subject=${encodeURIComponent("연학당 환불 요청")}&body=${encodeURIComponent(summary)}`} className="rounded-[12px] bg-brand-secondary px-4 py-3 text-center font-bold text-body-m-14 text-text-inverse">
            이메일로 환불 신청하기
          </a>
          {message && <p role="status" className="text-caption-12 text-brand-secondary">{message}</p>}
        </div>
      </div>
    </dialog>
  );
}
