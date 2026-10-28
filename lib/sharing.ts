/** Public browser key only. Never put an Admin or REST API key here. */
const javascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim();
type SharePayload = {
  objectType: "feed";
  content: { title: string; description: string; imageUrl: string; link: { mobileWebUrl: string; webUrl: string } };
  buttons: { title: string; link: { mobileWebUrl: string; webUrl: string } }[];
};
type KakaoSdk = {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: { sendDefault: (payload: SharePayload) => void | Promise<unknown> };
};
declare global { interface Window { Kakao?: KakaoSdk } }
let loading: Promise<void> | undefined;

export function prepareKakao(): Promise<void> {
  if (!javascriptKey) return Promise.reject(new Error("카카오톡 공유 설정이 필요해요. 링크 복사를 이용해 주세요."));
  if (window.Kakao?.isInitialized()) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      reject(new Error("카카오톡을 불러오지 못했어요. 네트워크를 확인하고 다시 눌러 주세요."));
    };
    const timer = window.setTimeout(fail, 15000);
    const initialize = () => {
      try {
        if (!window.Kakao) throw new Error("SDK unavailable");
        if (!window.Kakao.isInitialized()) window.Kakao.init(javascriptKey);
        clearTimeout(timer);
        resolve();
      } catch { fail(); }
    };
    if (window.Kakao) { initialize(); return; }
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js";
    script.integrity = "sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = initialize;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error: unknown) => { loading = undefined; throw error; });
  return loading;
}

/** Call synchronously from a click: awaiting SDK loading here can block popups. */
export function sendKakaoInvite(name: string, url: string) {
  if (!window.Kakao?.isInitialized()) throw new Error("카카오톡 공유를 준비 중이에요. 잠시 후 다시 눌러 주세요.");
  const link = { mobileWebUrl: url, webUrl: url };
  return window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `${name}님이 연학당에 초대했어요`,
      description: "내 동기 수석 합격자는 누구? 너도 사주로 내 학과를 확인해 봐!",
      imageUrl: new URL("/assets/major-wide.png", url).href,
      link,
    },
    buttons: [{ title: "내 학과 확인하기", link }],
  });
}

export async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return; }
  } catch { /* Older browsers and denied clipboard permission use selection. */ }
  const previous = document.activeElement as HTMLElement | null;
  const input = document.createElement("textarea");
  input.value = value;
  input.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(input);
  input.focus();
  input.select();
  try {
    if (!document.execCommand("copy")) throw new Error("링크 복사가 차단됐어요. 아래 링크를 직접 복사해 주세요.");
  } finally { input.remove(); previous?.focus(); }
}

export function downloadImage(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
