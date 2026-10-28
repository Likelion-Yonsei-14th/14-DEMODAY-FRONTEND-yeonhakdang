import type { ComponentType } from "react";

import { Landing } from "@/components/screens/01-landing/Landing";
import { LandingInvite } from "@/components/screens/01-landing/LandingInvite";
import { InputDateError } from "@/components/screens/02-input/InputDateError";
import { InputEmpty } from "@/components/screens/02-input/InputEmpty";
import { InputFilledNoTime } from "@/components/screens/02-input/InputFilledNoTime";
import { LoginKakao } from "@/components/screens/02-input/LoginKakao";
import { TermsSheet } from "@/components/screens/02-input/TermsSheet";
import { AnalyzingLoading } from "@/components/screens/03-result/AnalyzingLoading";
import { AnalyzingRetry } from "@/components/screens/03-result/AnalyzingRetry";
import {
  MajorResultFirstView,
  MajorResultFull,
} from "@/components/screens/03-result/MajorResult";
import { FriendCompatSheet } from "@/components/screens/04-roster/FriendCompatSheet";
import { RosterEmpty } from "@/components/screens/04-roster/RosterEmpty";
import { RosterFive } from "@/components/screens/04-roster/RosterFive";
import { KakaoMessagePreview } from "@/components/screens/05-share/KakaoMessagePreview";
import { SaveImageGuide } from "@/components/screens/05-share/SaveImageGuide";
import { ShareMajorCard } from "@/components/screens/05-share/ShareMajorCard";
import { ShareRosterCard } from "@/components/screens/05-share/ShareRosterCard";
import { ProductBenefactor } from "@/components/screens/06-product/ProductBenefactor";
import { ProductCharm } from "@/components/screens/06-product/ProductCharm";
import { ProductCompat } from "@/components/screens/06-product/ProductCompat";
import { OrderPayment } from "@/components/screens/07-pay/OrderPayment";
import { PayFailed } from "@/components/screens/07-pay/PayFailed";
import { PaySuccess } from "@/components/screens/07-pay/PaySuccess";
import { PickRelation } from "@/components/screens/07-pay/PickRelation";
import { PickUniversities } from "@/components/screens/07-pay/PickUniversities";
import { BenefactorResult } from "@/components/screens/08-paid/BenefactorResult";
import { CharmResult } from "@/components/screens/08-paid/CharmResult";
import { CompatResult } from "@/components/screens/08-paid/CompatResult";
import { InAppBrowserSheet } from "@/components/screens/09-locker/InAppBrowserSheet";
import { LockerMy } from "@/components/screens/09-locker/LockerMy";
import { MenuDrawer } from "@/components/screens/09-locker/MenuDrawer";
import { NetworkError } from "@/components/screens/09-locker/NetworkError";
import { NotFound } from "@/components/screens/09-locker/NotFound";
import { RefundPolicy } from "@/components/screens/10-policy/RefundPolicy";
import { PurchaseHistory } from "@/components/screens/10-policy/PurchaseHistory";

export type ScreenDef = {
  /** Figma frame number, e.g. "1-1" — also the prototype URL hash. */
  id: string;
  /** Figma frame name, verbatim. */
  name: string;
  /** Figma node id, for tracing a screen back to the design file. */
  nodeId: string;
  Component: ComponentType;
};

export type SectionDef = {
  id: string;
  /** Figma section name, verbatim. */
  name: string;
  nodeId: string;
  screens: ScreenDef[];
};

export const SECTIONS: SectionDef[] = [
  {
    id: "01",
    name: "01 진입 · Landing",
    nodeId: "19:105",
    screens: [
      { id: "1-1", name: "1-1 랜딩", nodeId: "19:108", Component: Landing },
      {
        id: "1-2",
        name: "1-2 랜딩 · 초대 링크 진입",
        nodeId: "19:174",
        Component: LandingInvite,
      },
    ],
  },
  {
    id: "02",
    name: "02 정보 입력 · 로그인",
    nodeId: "21:169",
    screens: [
      {
        id: "2-1",
        name: "2-1 정보 입력 · 빈 상태",
        nodeId: "21:172",
        Component: InputEmpty,
      },
      {
        id: "2-2",
        name: "2-2 정보 입력 · 입력 완료(시간 모름)",
        nodeId: "21:249",
        Component: InputFilledNoTime,
      },
      {
        id: "2-3",
        name: "2-3 정보 입력 · 오류(날짜 검증)",
        nodeId: "21:332",
        Component: InputDateError,
      },
      {
        id: "2-4",
        name: "2-4 로그인 · 카카오",
        nodeId: "22:319",
        Component: LoginKakao,
      },
      {
        id: "2-5",
        name: "2-5 약관 동의 · 바텀시트 (최초 로그인)",
        nodeId: "22:377",
        Component: TermsSheet,
      },
    ],
  },
  {
    id: "03",
    name: "03 분석 · 학과 결과",
    nodeId: "24:400",
    screens: [
      {
        id: "3-1",
        name: "3-1 분석 중 · 로딩",
        nodeId: "24:403",
        Component: AnalyzingLoading,
      },
      {
        id: "3-2",
        name: "3-2 분석 지연 · 재시도 (A-06 / C-06)",
        nodeId: "24:475",
        Component: AnalyzingRetry,
      },
      {
        id: "3-3",
        name: "3-3 학과 결과 · 내 학과 (전체 스크롤)",
        nodeId: "25:457",
        Component: MajorResultFull,
      },
      {
        id: "3-4",
        name: "3-4 학과 결과 · 첫 화면 (초대 친구 명단 자동 등록 토스트)",
        nodeId: "25:667",
        Component: MajorResultFirstView,
      },
    ],
  },
  {
    id: "04",
    name: "04 동기 합격자 명단",
    nodeId: "26:729",
    screens: [
      {
        id: "4-1",
        name: "4-1 합격자 명단 · 친구 5명",
        nodeId: "26:732",
        Component: RosterFive,
      },
      {
        id: "4-2",
        name: "4-2 합격자 명단 · 빈 명단 (M-09)",
        nodeId: "26:881",
        Component: RosterEmpty,
      },
      {
        id: "4-3",
        name: "4-3 친구 상세 궁합 · 바텀시트 (M-07)",
        nodeId: "26:961",
        Component: FriendCompatSheet,
      },
    ],
  },
  {
    id: "05",
    name: "05 공유하기",
    nodeId: "27:1008",
    screens: [
      {
        id: "5-1",
        name: "5-1 공유하기 · 학과 결과 카드 (9:16)",
        nodeId: "28:1022",
        Component: ShareMajorCard,
      },
      {
        id: "5-2",
        name: "5-2 공유하기 · 합격자 명단 카드 (1:1) + 링크 복사 토스트",
        nodeId: "28:1120",
        Component: ShareRosterCard,
      },
      {
        id: "5-3",
        name: "5-3 이미지 저장 · 인앱 브라우저 길게 눌러 저장 (S-03)",
        nodeId: "28:1209",
        Component: SaveImageGuide,
      },
      {
        id: "5-4",
        name: "5-4 카카오톡 공유 메시지 미리보기 (S-04 · S-07)",
        nodeId: "28:1272",
        Component: KakaoMessagePreview,
      },
    ],
  },
  {
    id: "06",
    name: "06 유료 상품 상세",
    nodeId: "29:1217",
    screens: [
      {
        id: "6-1",
        name: "6-1 합격 궁합 · 상품 상세",
        nodeId: "29:1220",
        Component: ProductCompat,
      },
      {
        id: "6-2",
        name: "6-2 귀인 · 상품 상세",
        nodeId: "29:1386",
        Component: ProductBenefactor,
      },
      {
        id: "6-3",
        name: "6-3 부적 · 상품 상세",
        nodeId: "29:1541",
        Component: ProductCharm,
      },
    ],
  },
  {
    id: "07",
    name: "07 추가 정보 · 결제",
    nodeId: "30:1418",
    screens: [
      {
        id: "7-1",
        name: "7-1 합격 궁합 · 지원 대학 선택 (PAY-05·06)",
        nodeId: "30:1421",
        Component: PickUniversities,
      },
      {
        id: "7-2",
        name: "7-2 귀인 · 관계 유형 선택 (PAY-05)",
        nodeId: "30:1513",
        Component: PickRelation,
      },
      {
        id: "7-3",
        name: "7-3 주문 · 결제 수단 선택 (PAY-01·02)",
        nodeId: "31:1481",
        Component: OrderPayment,
      },
      {
        id: "7-4",
        name: "7-4 결제 완료 (PAY-03)",
        nodeId: "31:1557",
        Component: PaySuccess,
      },
      {
        id: "7-3b",
        name: "7-3b 주문 · 3종 패키지 적용 (사이트 금액 = 결제창 금액)",
        nodeId: "251:3426",
        Component: OrderPayment,
      },
      {
        id: "7-5",
        name: "7-5 결제 실패 · 취소 (PAY-04)",
        nodeId: "31:1625",
        Component: PayFailed,
      },
    ],
  },
  {
    id: "08",
    name: "08 유료 결과",
    nodeId: "32:1576",
    screens: [
      {
        id: "8-1",
        name: "8-1 합격 궁합 · 결과 (PR-03)",
        nodeId: "32:1579",
        Component: CompatResult,
      },
      {
        id: "8-2",
        name: "8-2 귀인 · 결과 (PR-04)",
        nodeId: "33:1626",
        Component: BenefactorResult,
      },
      {
        id: "8-3",
        name: "8-3 부적 · 결과 (PR-01·02)",
        nodeId: "33:1762",
        Component: CharmResult,
      },
    ],
  },
  {
    id: "09",
    name: "09 보관함 · 예외 상황",
    nodeId: "34:1730",
    screens: [
      {
        id: "9-1",
        name: "9-1 보관함 · 마이 (B-01~04)",
        nodeId: "34:1733",
        Component: LockerMy,
      },
      {
        id: "9-2",
        name: "9-2 네트워크 오류 (C-06)",
        nodeId: "34:1835",
        Component: NetworkError,
      },
      {
        id: "9-3",
        name: "9-3 404 · 페이지 없음 (C-06)",
        nodeId: "34:1873",
        Component: NotFound,
      },
      {
        id: "9-4",
        name: "9-4 인앱 브라우저 안내 · 바텀시트 (C-07)",
        nodeId: "34:1907",
        Component: InAppBrowserSheet,
      },
      {
        id: "9-5",
        name: "9-5 상단 메뉴 · 드로어 (보관함 진입)",
        nodeId: "34:2004",
        Component: MenuDrawer,
      },
    ],
  },
  {
    id: "10",
    name: "10 정책 · 고객센터 (PG 심사 대응)",
    nodeId: "226:3212",
    screens: [
      {
        id: "10-1",
        name: "10-1 환불 정책 (약관 링크·푸터·상품 상세에서 진입)",
        nodeId: "226:3213",
        Component: RefundPolicy,
      },
      {
        id: "10-2",
        name: "10-2 구매 내역 · 환불 신청 (보관함·드로어에서 진입)",
        nodeId: "226:3325",
        Component: PurchaseHistory,
      },
    ],
  },
];

export const ALL_SCREENS: ScreenDef[] = SECTIONS.flatMap((s) => s.screens);
