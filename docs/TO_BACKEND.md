# 백엔드 담당자께 — 프론트·백엔드 통신 점검 결과

> 작성 2026-11-05 · 기준: 프론트 `main` `96f211d`, 백엔드 `main` `7e9d30f`
> 프론트 연동 방식 전체는 [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)에 있습니다. 이 문서는 **맞춰야 할 것**만 모았습니다.

기본 통신(API 경로·CSRF·쿠키 세션·`Idempotency-Key`·오류 코드·로그인 복귀 `/#9-1`·`/#2-4`·상품 가격)은 명세와 맞습니다.
아래 항목을 확인 부탁드립니다. 결정이 나면 체크하고 아래 "답변"에 한 줄 남겨 주세요.

## 🔴 1. 결제사가 서로 다릅니다 (가장 시급)

프론트는 2026-11-04에 **페이앱** 기준으로 바뀌었는데, 백엔드 `main`은 아직 **포트원** 기준입니다.
지금은 `SALES_ENABLED=false`라 `503 PAID_CONTENT_NOT_READY`에 가려져 있지만, 판매를 켜면 결제가 전부 실패합니다.

| | 프론트가 기대하는 것 | 백엔드 `main` 현재 |
|---|---|---|
| `POST /orders/{id}/prepare` 요청 | `{ method, phone }` | `{ method }` (`PrepareInput`) |
| `/prepare` 응답 | `{ provider: "PAYAPP", payUrl: "https://…payapp.kr/…" }` | 포트원 SDK 객체 (`storeId`, `channelKey`, …) |
| 결제 후 복귀 | 페이앱 → 백엔드 반환 경로 → 프론트 `/?checkoutOrder=주문ID` | 포트원 `redirectUrl`로 바로 복귀 |
| 결제 통보 | 페이앱 피드백 | `/api/webhooks/portone`만 존재 |
| 오류 코드 | `PAYMENT_PHONE_REQUIRED`, `PAYAPP_NOT_CONFIGURED`, `PAYAPP_MINIMUM_AMOUNT`, `PAYAPP_UNAVAILABLE`, `PAYAPP_REQUEST_REJECTED`, `PAYMENT_REQUEST_UNKNOWN` | 없음 |
| 명세 문서 | 백엔드 `docs/PAYAPP.md` | 리포에 없음 (원격 브랜치도 `main`뿐) |

프론트 쪽 구현: `lib/backend.ts`의 `prepareOrder`, `payAppPaymentUrl`, `lib/checkout.ts`의 `checkout`.

- [ ] 페이앱 작업이 로컬에만 있고 아직 push 전인가요? → push 부탁드립니다.
- [ ] 아니면 포트원으로 유지하나요? → 알려주시면 프론트를 포트원 SDK 방식으로 되돌리겠습니다.
- [ ] **부적 단품 990원 → 1,000원 확정** (페이앱 최소 결제금액 1,000원, 미만이면 오류 50054). 서버는 DB `product.price`로 청구하므로 백엔드 변경 없이는 계속 결제 불가입니다.
  - 마이그레이션 추가 (예: `V1_3__charm_price_1000.sql`): `UPDATE product SET price = 1000 WHERE code = 'charm';`
  - `RefundPolicy.java`: `PRICES`의 `charm` 990 → 1000, 부분 환불 분모 `5790` → `5800` (3종 패키지 3,790원은 그대로).
  - 예: 귀인 + 부적 미열람 시 ⌊3790 × 2900 / 5800⌋ = 1,895원 (기존 1,891원). 프론트 `packageRefund`는 이미 5,800 기준이라, 백엔드 반영 전까지 화면 환불액과 실제 환불액이 몇 원 어긋납니다.
  - 기존 990원 주문은 저장된 `amount` 그대로 둡니다 (프론트 구매 내역은 서버 `amount`를 표시).
  - 배포 순서: 백엔드 마이그레이션과 동시 또는 직후에 프론트 배포.

## 🔴 2. 열람 기록이 남지 않아 단순 변심 환불이 항상 통과됩니다 (정책 결정)

- 관리자가 콘텐츠를 등록하지 않으면 `POST /orders/{id}/products/{kind}/open`은 항상 `409 CONTENT_PENDING`이고 `first_viewed_at`을 남기지 않습니다.
- 프론트는 유료 결과 화면을 직접 그리므로, 사용자는 결과를 다 본 뒤에도 서버 기준 "미열람" → `CHANGE_OF_MIND` 환불이 통과됩니다.
- 부수 효과로 결과를 열 때마다 "결과를 준비하고 있어요" 토스트가 뜹니다 (`lib/useOpenRecord.ts`).

- [ ] (가) 콘텐츠 없이도 열람을 기록하는 방법 추가 (예: 프론트 렌더 결과용 `content_ready=false` 허용 옵션, 또는 별도 `POST …/viewed`) — **프론트 권장**
- [ ] (나) 콘텐츠 등록 전에는 프론트가 결과를 가림

## 🟡 3. 응답에 내부 필드가 섞여 나옵니다

`POST /api/orders`, `GET /api/orders/{id}`가 `select *` 행 전체를 돌려줘서 `member_id`, `result_id`, `idempotency_key`,
`request_fingerprint`, `consent_*` 등이 프론트로 옵니다 (`OrderService.create` → `db.order`, `Store.owned`).
프론트가 쓰는 필드는 `id, product_code, amount, currency, status, payment_id, created_at, paid_at` 그리고 복원용 `universities, relation`입니다.

- [ ] 주문 응답 필드 추리기

## 🟡 4. 프록시 구조라는 점 공유

프론트는 브라우저가 백엔드를 직접 부르지 않고 Next가 `/api/*`, `/oauth2/*`, `/login/oauth2/*`를 `BACKEND_ORIGIN`으로 프록시합니다
(`next.config.ts`). 그래서 백엔드 `FRONTEND_HANDOFF.md`의 CORS 직접 호출 전제와 설정이 다릅니다.

- [ ] `KAKAO_REDIRECT_URI` = 프론트 도메인 (`https://yeonhakdang.vercel.app/login/oauth2/code/kakao`, 로컬 `http://localhost:3000/login/oauth2/code/kakao`), 카카오 콘솔도 동일
- [ ] `FRONTEND_ORIGIN` = `https://yeonhakdang.vercel.app` (로컬 `http://localhost:3000`)
- [ ] 프록시 뒤 리다이렉트 주소가 백엔드 도메인으로 만들어지지 않는지 확인 (필요 시 `server.forward-headers-strategy=framework`)
- [ ] 개발 서버 HTTPS 주소 공유 → 프론트 `BACKEND_ORIGIN`에 넣겠습니다
- 참고: `/api/*` 전체 프록시라 `/api/admin/*`·웹훅도 프론트 도메인으로 닿습니다. 프론트에서 제외할 예정이니 관리자 도구는 백엔드 주소로 직접 쓰시면 됩니다.

## 🟢 5. 프론트가 아직 안 쓰는 API (프론트 작업 예정, 의견 있으면 알려주세요)

| API | 프론트 계획 |
|---|---|
| `POST /orders/{id}/complete` 재호출 | 구매 내역의 "확인 중"(`PENDING`·`REVIEW_REQUIRED`) 주문에 "결제 상태 다시 확인" 버튼 |
| `GET /orders/{id}` | 다른 기기 로그인 시 주문의 `universities`·`relation` 복원 |
| `GET /results` | 재로그인·다른 기기에서 기존 결과 ID 재사용 |
| `/locker`의 `content_ready`·`first_viewed_at`, `REFUND_PENDING` | 보관함에 "준비 중 / 열람함 / 환불 처리 중" 표시 |

질문: 사주 입력 원본은 서버에 안 보내므로 다른 기기에서는 결과 화면을 그대로 다시 그릴 수 없습니다. "같은 기기에서만 다시 보기"로 둬도 될까요?

## 답변

<!-- 예: 1. 페이앱 브랜치 11/6 push 예정 — 홍길동 -->

