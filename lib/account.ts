"use client";

import { ApiError, USE_BACKEND, errorMessage, logout, withdraw } from "@/lib/backend";
import { INITIAL_STATE, type Proto } from "@/lib/proto";

/** 로그아웃: ends the server session too when the backend is on. */
export async function signOut(proto: Proto) {
  if (USE_BACKEND) {
    try {
      await logout();
    } catch (error) {
      // Already logged out on the server is fine; anything else stops here.
      if (!(error instanceof ApiError && error.status === 401)) return proto.toast(errorMessage(error));
    }
  }
  // The demo keeps 약관 consent across logins; the server re-checks it per login.
  proto.reset("1-1", { ...INITIAL_STATE, agreedTerms: USE_BACKEND ? false : proto.state.agreedTerms });
  proto.toast("로그아웃했어요");
}

/** 회원 탈퇴: irreversible on the server, so it asks first. */
export async function deleteAccount(proto: Proto) {
  if (USE_BACKEND) {
    if (!window.confirm("탈퇴하면 보관함의 결과가 모두 삭제되고 되돌릴 수 없어요. 탈퇴할까요?")) return;
    try {
      await withdraw();
    } catch (error) {
      return proto.toast(errorMessage(error));
    }
  }
  proto.reset("1-1", INITIAL_STATE);
  proto.toast("탈퇴했어요 · 모든 결과를 지웠어요");
}
