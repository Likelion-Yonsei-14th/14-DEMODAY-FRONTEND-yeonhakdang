# 백엔드 담당자께: 프론트·백엔드 통신 점검 결과 (2차)

> 작성 2026-11-12 · 기준: 프론트 `main` `e3e73f5`, 백엔드 `main` `e2dd1b6`
> 프론트 연동 방식 전체는 [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)에 있습니다. 이 문서는 **백엔드에서 맞춰야 할 것**만 모았습니다.
> 결정되거나 처리되면 체크하고, 아래 "답변"에 한 줄 남겨 주세요.

API 경로·메서드 24개와 요청·응답 필드는 프론트와 맞습니다. 확인한 항목은 맨 아래에 있습니다.
1차 점검(11/5)의 페이앱 전환, 부적 1,000원 가격, 열람 기록 문제는 해결된 것을 확인했습니다. 남은 것은 아래 4건입니다.

## 🔴 1. 프록시 뒤에서 카카오 로그인 콜백이 실패합니다 (배포 설정)

브라우저는 백엔드를 직접 부르지 않습니다. Next가 `/api/*`, `/oauth2/*`, `/login/oauth2/*`를 `BACKEND_ORIGIN`으로 프록시합니다.
그래서 카카오 콜백은 `https://yeonhakdang.vercel.app/login/oauth2/code/kakao`로 들어와 백엔드로 전달됩니다.

- 프록시는 `Host`를 백엔드 주소로 바꾸고, 원래 주소는 `X-Forwarded-Host`(Vercel은 `X-Forwarded-Proto`도)에 담아 보냅니다.
- 백엔드 `application.yml`의 `server.forward-headers-strategy`는 `${FORWARD_HEADERS_STRATEGY:none}`이라 이 헤더를 무시합니다.
- Spring Security는 콜백 요청 URL로 redirect_uri를 다시 계산해서, 로그인 시작 때 저장한 값(`KAKAO_REDIRECT_URI`, 프론트 도메인)과 비교합니다.
  값이 다르면 `invalid_redirect_uri_parameter`로 실패하고, 사용자는 `/#2-4`(로그인 실패)로 돌아갑니다.

- [ ] 개발·운영 서버 환경변수에 `FORWARD_HEADERS_STRATEGY=framework` 추가
  - 호스팅 앞단 프록시가 `X-Forwarded-*`를 덮어쓰는지도 확인해 주세요. 원래 호스트가 `yeonhakdang.vercel.app`으로 남아야 합니다.
- [ ] `docs/DEPLOYMENT.md` 56행 수정: `KAKAO_REDIRECT_URI=https://<실제-API-호스트>/...`가 아니라 **프론트 도메인**이어야 합니다.
  `docs/PAYAPP_DEPLOYMENT.md` 20행과 같은 값입니다. 카카오 콘솔의 Redirect URI도 같은 값으로 등록합니다.
  - 운영: `https://yeonhakdang.vercel.app/login/oauth2/code/kakao`
  - 로컬: `http://localhost:3000/login/oauth2/code/kakao`
- [ ] `docs/DEPLOYMENT.md`의 `COOKIE_SAME_SITE=None` 권장 삭제. 프록시 구조에서는 쿠키가 프론트 도메인의 first-party 쿠키라 `lax`면 충분합니다.

확인 방법: 배포 후 `https://yeonhakdang.vercel.app`에서 카카오 로그인을 했을 때 `/#9-1`(또는 첫 로그인이면 약관 화면)로 돌아오면 정상입니다.

## 🟠 2. 패키지 부분 환불 금액이 화면 안내와 다릅니다

V5 마이그레이션에서 `product.price`만 1,000원으로 바뀌었고, `RefundPolicy.java`는 그대로입니다.

```java
// RefundPolicy.java:8, 12
PRICES = Map.of("compat",2900,"benefactor",1900,"charm",990);   // ← 990
return (int)(3790L*...sum()/5790);                              // ← 5790
```

프론트 환불규정 화면(`lib/catalog.ts`의 `packageRefund`)은 1,000원, 합계 5,800원 기준입니다. 환불 신청 6가지 조합 전부 금액이 다릅니다.

| 열지 않은 상품 | 화면 안내 (÷5,800) | 실제 환불 (÷5,790) |
|---|---|---|
| 궁합 | 1,895원 | 1,898원 |
| 귀인 | 1,241원 | 1,243원 |
| 궁합 + 귀인 | 3,136원 | 3,141원 |
| 부적 | 653원 | 648원 |
| 궁합 + 부적 | 2,548원 | 2,546원 |
| 귀인 + 부적 | 1,895원 | 1,891원 |

- [ ] `PRICES`의 `charm`을 `1000`으로, 분모를 `5800`으로 수정 (가능하면 `PRICES` 합계에서 계산)
- [ ] `RefundPolicyTest` 기대값 갱신
- [ ] 결정 필요: 부적 990원 시절에 산 패키지 주문의 부분 환불에 새 공식을 적용할지 정해 주세요.
  패키지 금액(3,790원)은 같아서 차이는 몇 원이지만, 환불규정 문구와 맞아야 합니다.

## 🟡 3. 응답에 내부 필드가 섞여 나옵니다

| API | 원인 | 노출되는 필드 |
|---|---|---|
| `GET /api/orders/{id}/refunds` | `RefundService.get` → `select *` | `reviewed_by`(처리한 관리자 계정 UUID), `cancellation_id`, `baseline_cancelled` |
| `POST /api/orders`, `GET /api/orders/{id}` | `db.order` / `db.owned` → `select *` | `member_id`, `result_id`, `idempotency_key`, `request_fingerprint`, `consent_*`, `sync_revision` |

프론트가 쓰는 필드는 아래와 같습니다.
- 환불: `id, order_id, reason, status, amount, created_at, reviewed_at`
- 주문: `id, product_code, amount, currency, status, payment_id, created_at, paid_at`

- [ ] 두 응답의 필드를 위 목록으로 줄이기 (특히 관리자 UUID)

## 🟡 4. 결제 수단: 프론트는 `PAYAPP_METHODS`와 같은 값을 써야 합니다

예전에는 프론트가 카드·카카오페이·토스페이를 모두 보여줬습니다. 백엔드 기본값 `PAYAPP_METHODS=CARD`에서는 나머지 둘이 주문과 스냅샷을 만든 **뒤에**
`503 CHANNEL_NOT_CONFIGURED`로 실패해서, 쓰이지 않는 `CREATED` 주문이 남았습니다.

프론트를 고쳐서 이제 `NEXT_PUBLIC_PAY_METHODS`(기본 `CARD`)에 있는 수단만 보여줍니다.

- [ ] `PAYAPP_METHODS`를 바꿀 때는 알려 주세요. 프론트 Vercel 환경변수 `NEXT_PUBLIC_PAY_METHODS`도 같은 값으로 바꾸고 다시 배포해야 합니다.

## 참고: 프론트에서 이번에 고친 것

| 내용 | 위치 |
|---|---|
| `/orders/{id}/complete`가 `409 PAYMENT_STATE_CHANGED`(페이앱 통보와 동시에 처리된 경우)를 주면 0.5초 간격으로 최대 3번 다시 시도 (`/me/library`와 같은 방식) | `lib/checkout.ts` `confirmOrder` |
| `ALREADY_OWNED`, `PAYMENT_STATE_CHANGED` 안내 문구 추가 | `lib/backend.ts` `MESSAGES` |
| 결제 수단을 `NEXT_PUBLIC_PAY_METHODS`로 제한 | `lib/backend.ts` `PAY_METHODS`, `OrderPayment.tsx` |
| `/api/admin/*`은 프록시하지 않음. 관리자 도구는 백엔드 주소로 직접 접속해 주세요 | `next.config.ts` |

웹훅(`/api/webhooks/payapp`)과 결제 복귀(`/api/payments/payapp/return`)는 계속 프록시합니다. `BACKEND_PUBLIC_ORIGIN`을 프론트 도메인으로 두든 백엔드 도메인으로 두든 둘 다 동작합니다.

## 일치를 확인한 항목

- CSRF: `/api/csrf`, `X-CSRF-TOKEN`, 토큰 만료 시 403 한 번 재시도. 로그아웃은 `POST /api/logout` → 204
- 401 공통 처리(`UNAUTHENTICATED`, `ACCOUNT_INACTIVE`)
- `Idempotency-Key` 형식(`checkout_<UUID>`), 주문 본문(관계 4종, 대학 최대 6곳, 동의 플래그)
- 결과 요약: 오행 키 5개, 합계 6 또는 8, 학과 점수 0–100 정수
- 분석 프로필: `accountId`·`revision`·`profile`, 이름 10자, `YYYY.MM.DD`. 분석이 끝난 뒤에만 저장
- 결과 스냅샷: 상품별 필수 배열, 부적 4종 중 첫 번째가 `results.charm`, 대학·관계가 주문과 일치
- 페이앱: `{ method, phone }` → `{ provider: "PAYAPP", payUrl }`, `payapp.kr` HTTPS 도메인 검사(양쪽 동일), 복귀 `/?checkoutOrder=`
- 초대·친구 명단 응답 형식, 보관함·주문 필드, 환불이 없을 때 404
- 상품 가격 2,900 / 1,900 / 1,000 / 3,790
- 저장된 결과 열람(`saved-results/{kind}/open`)이 `first_viewed_at`을 기록함

실제 서버·카카오·페이앱과 붙여서 브라우저로 확인한 것은 아닙니다. 1번 설정이 반영되면 [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)의 실서버 체크리스트로 같이 확인하면 좋겠습니다.

## 답변

<!-- 예: 1. FORWARD_HEADERS_STRATEGY 11/13 반영 — 담당자 이름 -->
