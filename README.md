# 연학당 · 데모데이 프로토타입

Figma 파일 [데모데이 (복사)](https://www.figma.com/design/SyIjHZ302UZNLckGxBm3Zj/)의 33개 화면을
**유저플로우(Figma "유저플로우" 페이지)대로 버튼이 동작하는** 스마트폰 프로토타입으로 구현했습니다.

```
npm run dev     # http://localhost:3000
```

- 배포: (Vercel 프로덕션 URL — 연동 후 기입)
- 데스크톱에서는 폰 프레임과 사이드바가, 휴대폰에서는 화면 전체가 프로토타입입니다.

## 시연 방법

| 하고 싶은 것 | 방법 |
| --- | --- |
| 처음부터 시작 | `/` 접속. 이전 진행 상황은 `localStorage`에 남아 새로고침해도 이어집니다 |
| 친구 초대 링크로 시작 | `/?invite=1` — 초대 랜딩(1-2)부터 새 세션으로 시작 |
| 특정 화면으로 이동 | 데스크톱 사이드바의 화면 목록, 또는 `/#화면번호` (예: `/#6-1`) |
| 데모 패널 열기 | 데스크톱은 사이드바, 휴대폰은 **상단 상태바(9:41)를 세 번 탭** |
| 분기 강제 | 패널의 토글: 분석 지연(다음 1회 → 3-2), 결제 실패(다음 1회 → 7-5), 빈 명단(→ 4-2) |
| 예외 화면 | 패널의 "네트워크 오류(9-2)", "인앱 안내(9-4)" 버튼. 없는 주소는 404(9-3) |
| 상태 초기화 | 패널의 "처음부터 다시", 보관함의 로그아웃 · 회원 탈퇴 |

카카오톡 · 인스타그램 인앱 브라우저에서 열면 인앱 안내(9-4)가 탭마다 한 번 자동으로 뜹니다.

## 동작 범위

- 입력한 이름은 결과 · 명단 · 보관함 · 공유 카드에, 생년월일은 분석 화면(3-1)에 반영됩니다.
  분석 결과 내용(학과 TOP 3 등)은 고정입니다.
- 링크 복사는 실제 클립보드에 초대 링크(`/?invite=1`)를 복사하고, 이미지 저장은 현재 카드를
  1080px PNG로 내려받습니다. 인앱 브라우저에서는 실제 생성된 이미지를 길게 눌러 저장합니다.
- 카카오톡 공유는 실제 SDK를 사용합니다(아래 설정 필요). 키가 없으면 휴대폰은 기기 공유 창(카카오톡 포함),
  PC는 링크 복사로 대체합니다.
  카카오 로그인 · PG 결제창은 화면으로 흉내 냅니다. 디자인이 없는 기능(공지,
  약관 전문, 구매 내역 등)은 "준비 중" 토스트를 띄웁니다.
- `BACKEND_ORIGIN`과 `NEXT_PUBLIC_USE_BACKEND=true`를 설정하면 로그인 · 약관 동의 · 결제 · 보관함 ·
  구매 내역 · 환불이 실제 백엔드를 사용합니다. 설정과 남은 준비 사항은
  [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md)에 있습니다.

## 구조

| 경로 | 내용 |
| --- | --- |
| `app/page.tsx` | 프로토타입 진입점 (클라이언트 전용 렌더) |
| `app/not-found.tsx` | 없는 주소 → `/#9-3` |
| `components/proto/Prototype.tsx` | 화면 스택, 브라우저 뒤로가기, 상태 저장, 사이드바 · 데모 패널 · 드로어 · 토스트 |
| `components/proto/DemoPanel.tsx` | 데모 패널 (리셋, 분기 토글, 예외 화면) |
| `lib/proto.tsx` | 프로토타입 상태(`ProtoState`) · 데모 토글 · 이동 API (`go` / `back` / `reset` …) |
| `lib/screens.ts` | 화면 레지스트리 (Figma 프레임 이름 · 노드 ID) |
| `app/globals.css` | Figma 변수를 Tailwind v4 `@theme` 토큰으로 선언 |
| `components/screens/NN-*/` | 화면 단위 조립 |
| `components/chrome/` · `ui/` · `mascot/` · `share/` 등 | Figma 공용 · 섹션별 컴포넌트 |
| `public/assets/` | Figma에서 내보낸 아이콘 · 일러스트 |

모든 버튼은 `components/ui/Tap.tsx`를 거치고, 각 컴포넌트 상단 주석에 대응하는 Figma 노드 ID가
있습니다. 계획과 결정 사항, Figma 내부 충돌(열린 이슈)은 [`docs/prototype-plan.md`](docs/prototype-plan.md)에 있습니다.

## 실제 공유 설정

카카오 앱은 백엔드 카카오 로그인과 **같은 앱**을 씁니다. 키가 빌드에 들어가야 하므로 환경변수를 바꾼 뒤에는 꼭 다시 빌드·배포합니다.

**배포 (Vercel)**

1. Kakao Developers → 내 애플리케이션 → 앱 → **앱 키**에서 **JavaScript 키**를 복사합니다 (REST API 키·Admin 키 아님).
2. Vercel → 프로젝트 → Settings → Environment Variables에 `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` = 위 키를 Production(필요하면 Preview도)에 추가합니다.
3. Kakao Developers → 앱 → 플랫폼 키 → JavaScript 키 → **JavaScript SDK 도메인**에 `https://yeonhakdang.vercel.app`을 등록합니다.
4. Kakao Developers → 앱 → 제품 링크 관리 → **웹 도메인**에 `https://yeonhakdang.vercel.app`을 등록합니다. 등록하지 않은 도메인의 링크는 카톡 메시지에서 열리지 않습니다.
5. Vercel → Deployments에서 최신 배포를 **Redeploy**합니다.

**로컬**

1. `.env.example`을 `.env.local`로 복사하고 `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`를 넣습니다.
2. 위 3·4번에 `http://localhost:3000`도 등록합니다. 다만 카톡을 받은 휴대폰에서는 localhost 링크가 열리지 않으므로, 받은 링크까지 확인하려면 배포 주소로 테스트합니다.
3. `NEXT_PUBLIC_SITE_URL`에 실제 HTTPS 배포 주소를 넣으면 로컬에서 보내도 링크가 배포 주소로 갑니다. 비워 두면 현재 origin을 사용합니다.

공식 안내: [SDK 초기화](https://developers.kakao.com/docs/ko/javascript/getting-started),
[카카오톡 공유](https://developers.kakao.com/docs/ko/kakaotalk-share/js-link).

친구 초대하기 → 공유 화면 → 카카오톡 공유 → 카카오에서 받을 채팅방 선택 → 전송 순서입니다.
SDK 2.8.4를 공식 SRI로 검증하며, 클릭 전에 로드합니다. 로딩이 늦으면 준비 후 다시 누르도록 안내하여 팝업 차단을 방지합니다.
SDK 호출은 실제 전송 완료를 보장하지 않으므로 전송 성공 토스트를 표시하지 않습니다.
카카오 메시지는 대표 이미지와 초대자 이름·링크를 공유하며, 개인화 PNG는 이미지 저장/공유로 제공합니다.
키가 없으면 카카오톡 공유는 기기 공유 창(휴대폰, 목록에 카카오톡 포함) → 링크 복사(PC) 순으로 대체합니다.
클립보드가 차단되면 직접 복사할 입력창을 표시합니다.
공유 카드 이미지는 공유 화면이 열리면 백그라운드에서 미리 만들어 둡니다(`lib/cardImage.ts`). 카드에 쓰인 글자에 필요한
폰트 조각만 넣어서, 한글 웹폰트 조각 전체(약 620개)를 매번 내려받던 때보다 훨씬 빠릅니다.
이미지 저장은 PC에서 바로 다운로드, 인앱 브라우저에서는 길게 눌러 저장하는 시트를 엽니다.
인스타 스토리는 9:16 PNG로 기기 공유 창을 엽니다(휴대폰에서 인스타그램 선택). 공유 창이 없는 환경(PC 등)은 이미지를 저장하고
휴대폰 인스타그램에서 올리도록 안내합니다. 웹에서 특정 앱의 스토리로 자동 게시하지는 못합니다.

검증: `npm test`, `npm run lint`, `npm run build`.
실기기에서는 등록된 HTTPS 주소에서 카카오톡 전송/취소/받은 링크, Safari·Chrome·카카오 인앱의 PNG 저장을 확인합니다.
키와 카카오 앱 설정이 없는 환경에서는 실제 채팅방 전송까지 검증할 수 없습니다.
