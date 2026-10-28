# 백엔드 연동

[14-DEMODAY-BACKEND-yeonhakdang](https://github.com/Likelion-Yonsei-14th/14-DEMODAY-BACKEND-yeonhakdang)의
`docs/API.md` 명세에 맞춰 프론트를 연결한 내용입니다. 서버 호출은 모두 `lib/backend.ts`를 거칩니다.

## 켜고 끄기

| 환경변수 | 어디서 쓰나 | 값 |
| --- | --- | --- |
| `BACKEND_ORIGIN` | `next.config.ts` 프록시 (서버 전용) | 백엔드 주소. 예: `http://localhost:8080`, 배포 HTTPS 주소 |
| `NEXT_PUBLIC_USE_BACKEND` | 브라우저 | `true`면 서버 모드 |

- 둘 다 비우면 **지금까지의 데모 그대로** 동작합니다 (가짜 로그인·결제, 기기 저장).
- 둘 다 빌드 시점에 반영되므로 바꾼 뒤에는 `npm run build`(Vercel은 재배포)를 다시 해야 합니다.
- Vercel에서는 Project Settings → Environment Variables에 두 값을 넣습니다.

### 통신 구조

브라우저는 백엔드를 직접 부르지 않습니다. Next가 아래 경로를 `BACKEND_ORIGIN`으로 프록시하므로 브라우저 입장에서는
같은 출처이고, 세션 쿠키(`YHDSESSION`)가 1st-party 쿠키가 되어 CORS·SameSite 문제가 없습니다.

- `/api/*` — REST API
- `/oauth2/*` — 카카오 로그인 시작
- `/login/oauth2/*` — 카카오 로그인 콜백

## 화면별로 바뀐 동작 (서버 모드)

| 화면 | 동작 |
| --- | --- |
| 앱 시작 | `/api/me`로 로그인·필수 동의 확인, `/api/locker`로 보유 상품 동기화. 개발 모드에서는 `/api/products` 가격과 화면 가격(`lib/catalog.ts`)이 다르면 콘솔 경고 |
| 2-4 로그인 | 카카오 버튼 → `/oauth2/authorization/kakao` 전체 이동. 떠나기 전에 돌아갈 화면(`afterLogin`)을 즉시 저장. 이미 로그인했는데 약관만 없으면 카카오를 다시 거치지 않고 2-5로 |
| 로그인 복귀 | 백엔드는 성공 시 `/#9-1`, 실패 시 `/#2-4`로 보냄 → 필수 동의가 없으면 2-5, 있으면 저장해 둔 화면으로 이동 |
| 2-5 약관 | `/api/policies` 버전으로 `/api/me/consents` 저장 (14세·이용약관·개인정보·마케팅) |
| 7-3 결제 | 결과 요약 저장(`/api/results`, 같은 계정·같은 입력이면 재사용) → 주문(`Idempotency-Key` 유지, 취소된 주문이면 새 키) → `/prepare` → 결제창으로 이동 직전 상태 즉시 저장 → 포트원 SDK |
| 결제 복귀 | 백엔드가 `forceRedirect`라 PC·모바일 모두 `/?checkoutOrder=주문ID`로 돌아옴 → 서버 `/complete`로 확인 (502면 2초 간격 3회 재조회). 결과: 완료 → 7-4, 실패·취소 → 7-5(포트원 실패 사유 표시), **확인 중(`PENDING`·`REVIEW_REQUIRED`) → 구매 내역(10-2)** — 돈이 나갔을 수 있으므로 실패로 안내하지 않음 |
| 8-1·8-2·8-3 유료 결과 | 화면을 실제로 열 때만 `/open` 호출 (최초 열람 기록). 화면 내용은 지금처럼 프론트가 그림 |
| 10-2 구매 내역 | `/api/orders` 중 결제가 진행된 주문만 표시(결제창에서 그만둔 주문은 숨김), 결제 완료 주문마다 환불 신청(`/refunds`, 사유 7종) |
| 로그아웃 · 탈퇴 | `/api/logout`, `DELETE /api/me` (탈퇴는 확인 창) 후 기기 데이터 초기화 |
| 세션 만료 | 어떤 API든 401이면 로그인 상태를 끔 |

기기에만 남는 것: 친구 명단·초대, 사주 입력 원본, 부적 다시 뽑기 횟수. 서버에는 이름·생년월일·출생시간·성별을 보내지 않고
오행 개수와 추천 학과 ID·점수만 보냅니다.

오류는 `{ code }`를 한글 안내로 바꿔 토스트로 보여줍니다(`lib/backend.ts`의 `MESSAGES`). 401은 로그인으로,
`REQUIRED_CONSENT`는 약관 시트로 보냅니다.

### 로컬에서 백엔드와 같이 띄우기

1. 백엔드: README대로 실행하되 `COOKIE_SECURE=false`(로컬 HTTP), `FRONTEND_ORIGIN=http://localhost:3000`,
   `KAKAO_REDIRECT_URI=http://localhost:3000/login/oauth2/code/kakao`. 카카오 콘솔 Redirect URI에도 같은 값을 등록합니다.
2. 프론트 `.env.local`: `BACKEND_ORIGIN=http://localhost:8080`, `NEXT_PUBLIC_USE_BACKEND=true` → `npm run dev`.
3. 브라우저는 `http://localhost:3000`만 엽니다. `localhost:8080`을 직접 열면 쿠키가 다른 출처에 생겨 로그인이 이어지지 않습니다.

## 백엔드 담당자에게 요청할 것

프론트만으로는 해결되지 않아 실서버 테스트 전에 필요한 항목입니다.

1. **개발 서버 배포 (HTTPS)** — 그 주소를 프론트 `BACKEND_ORIGIN`에 넣습니다.
2. **카카오 콜백 주소를 프론트 도메인으로 등록** — 프록시를 거치므로
   `KAKAO_REDIRECT_URI=https://yeonhakdang.vercel.app/login/oauth2/code/kakao` (로컬은 `http://localhost:3000/login/oauth2/code/kakao`)이고,
   카카오 개발자 콘솔의 Redirect URI도 같은 값이어야 합니다.
3. **`FRONTEND_ORIGIN`** — 로그인·결제 복귀 주소. 배포는 `https://yeonhakdang.vercel.app`, 로컬은 `http://localhost:3000`.
4. **프록시 헤더** — 프록시 뒤에서 리다이렉트 주소가 백엔드 도메인으로 만들어지지 않는지 확인. 필요하면
   `server.forward-headers-strategy=framework` 설정.
5. **포트원 테스트 채널 연결과 `SALES_ENABLED`** — 지금은 `/prepare`가 `503 PAID_CONTENT_NOT_READY`라
   프론트에서는 "유료 결과를 준비하고 있어요" 안내까지만 보입니다.
6. **유료 콘텐츠 형식 합의** — 지금은 `/open`을 열람 기록 용도로만 쓰고 화면은 프론트가 그립니다.
   서버 콘텐츠로 그리려면 JSON 형식을 정해야 합니다.

## 아직 정해야 할 것

- **열람 기록과 환불 (중요)**: 서버 콘텐츠가 없으면 `/open`이 `CONTENT_PENDING`을 주고 열람 시각을 남기지 않는데,
  프론트는 결과를 그대로 보여줍니다. 그래서 결과를 본 뒤에도 서버 기록상 "미열람"이라 단순 변심 환불이 통과됩니다.
  ① 백엔드가 콘텐츠 없이도 열람을 기록하거나 ② 서버 콘텐츠가 준비될 때까지 유료 결과를 보여주지 않는 것 중 하나로 정해야 합니다.
- **구매자 정보**: KCP 등 채널에 따라 구매자 이름·연락처·이메일이 필수일 수 있으나 `/prepare` 응답에는 고객 정보가 없습니다.
- **미리보기 배포**: 로그인·결제 복귀가 `FRONTEND_ORIGIN`(운영 주소)으로 가므로 Vercel 미리보기 주소에서는 끝까지 테스트할 수 없습니다.
- **프록시 범위**: `/api/*` 전체를 넘기므로 `/api/admin`, 웹훅도 프론트 도메인으로 접근됩니다. 인증은 백엔드가 하지만 관리자 API는 빼는 것을 권장합니다.
- **로그아웃 시 기기 데이터**: 데모와 같이 친구 명단·분석 입력까지 지웁니다. 서버 모드에서도 이게 맞는지 결정이 필요합니다.

## 실서버 테스트 체크리스트

백엔드 개발 서버와 위 설정이 준비되면 실제 기기에서 확인합니다.

- [ ] 상품·가격: 개발 모드 콘솔에 가격 불일치 경고가 없다
- [ ] 첫 로그인: 카카오 → 2-5 약관 → 동의 후 원래 화면(예: 결제 화면)으로 돌아온다
- [ ] 재로그인: 약관 시트 없이 바로 원래 화면으로 돌아온다
- [ ] 새로고침해도 로그인 상태가 유지된다 (Safari, 카카오 인앱 브라우저 포함)
- [ ] 결제(PC): 결제창 → 완료 → 7-4, 보관함에 상품 표시
- [ ] 결제(모바일): PG 페이지 → `?checkoutOrder=` 복귀 → 7-4
- [ ] 결제창 닫기/실패 → 7-5, 다시 결제해도 주문이 중복 생성되지 않는다
- [ ] 유료 결과를 열면 `first_viewed_at`이 기록된다 (콘텐츠 미준비면 안내 토스트)
- [ ] 구매 내역 목록, 환불 신청 → 상태 표시, 같은 신청 반복 시 같은 결과
- [ ] 로그아웃 후 `/api/me`가 401, 탈퇴 후 보관함이 비어 있다

## 검증한 것

- `npm test`: API 클라이언트 단위 테스트 (명세 예시 응답 사용) — CSRF 발급·재시도, Idempotency-Key, 오류 코드 변환,
  401 공통 처리, 결과 요약 형식, 주문 본문, 동의 판정, 보관함 변환, 가격 비교, 결제 확인 결과 판정(완료·실패·확인 중),
  재결제 가능 상태, 구매 내역 표시 대상, 계정별 결과 재사용, 결제 복귀 주소 해석
- 데모 모드·서버 모드 각각 `npm run build`
- 명세대로 응답하는 임시 서버로 프록시 확인: API 응답, 로그인 시작·콜백 리다이렉트, `Set-Cookie` 전달, CSRF 헤더 전달

실제 백엔드·카카오·포트원과의 통신과 브라우저 화면 흐름은 아직 확인하지 못했습니다 (위 체크리스트).
