/**
 * 7-1 지원 대학 선택's catalogue and search. 전국 4년제 대학 · 교육대학 ·
 * 과학기술원 · 사관학교, one row per campus. `name` is what people type (the
 * "국립" prefix and nicknames live in `aliases`); the order is the order ties
 * are listed in.
 */

export type University = { name: string; campus: string; aliases?: string[] };

export const UNIVERSITIES: University[] = [
  // 서울
  { name: "서울대학교", campus: "서울 관악구", aliases: ["설대", "SNU"] },
  { name: "연세대학교", campus: "서울 서대문구 · 신촌캠퍼스", aliases: ["연대"] },
  { name: "연세대학교", campus: "강원 원주시 · 미래캠퍼스", aliases: ["연대", "원세대"] },
  { name: "고려대학교", campus: "서울 성북구 · 안암캠퍼스", aliases: ["고대"] },
  { name: "고려대학교", campus: "세종 · 세종캠퍼스", aliases: ["고대", "세고대"] },
  { name: "성균관대학교", campus: "서울 종로구 · 인문사회과학캠퍼스", aliases: ["성대", "SKKU"] },
  { name: "성균관대학교", campus: "경기 수원시 · 자연과학캠퍼스", aliases: ["성대", "SKKU"] },
  // Out of its region: the 7-1 frame lists it right after 성균관 for "성균".
  { name: "성결대학교", campus: "경기 안양시" },
  { name: "서강대학교", campus: "서울 마포구" },
  { name: "한양대학교", campus: "서울 성동구 · 서울캠퍼스", aliases: ["한대"] },
  { name: "한양대학교", campus: "경기 안산시 · ERICA캠퍼스", aliases: ["한대", "에리카"] },
  { name: "중앙대학교", campus: "서울 동작구 · 서울캠퍼스", aliases: ["중대"] },
  { name: "중앙대학교", campus: "경기 안성시 · 다빈치캠퍼스", aliases: ["중대"] },
  { name: "경희대학교", campus: "서울 동대문구 · 서울캠퍼스" },
  { name: "경희대학교", campus: "경기 용인시 · 국제캠퍼스" },
  { name: "한국외국어대학교", campus: "서울 동대문구 · 서울캠퍼스", aliases: ["외대", "한국외대", "HUFS"] },
  { name: "한국외국어대학교", campus: "경기 용인시 · 글로벌캠퍼스", aliases: ["외대", "한국외대", "HUFS"] },
  { name: "서울시립대학교", campus: "서울 동대문구", aliases: ["시립대"] },
  { name: "이화여자대학교", campus: "서울 서대문구", aliases: ["이대", "이화여대"] },
  { name: "건국대학교", campus: "서울 광진구 · 서울캠퍼스", aliases: ["건대"] },
  { name: "건국대학교", campus: "충북 충주시 · 글로컬캠퍼스", aliases: ["건대"] },
  { name: "동국대학교", campus: "서울 중구 · 서울캠퍼스", aliases: ["동대"] },
  { name: "동국대학교", campus: "경북 경주시 · WISE캠퍼스", aliases: ["동대"] },
  { name: "홍익대학교", campus: "서울 마포구 · 서울캠퍼스", aliases: ["홍대"] },
  { name: "홍익대학교", campus: "세종 · 세종캠퍼스", aliases: ["홍대"] },
  { name: "숙명여자대학교", campus: "서울 용산구", aliases: ["숙대", "숙명여대"] },
  { name: "국민대학교", campus: "서울 성북구", aliases: ["국대"] },
  { name: "숭실대학교", campus: "서울 동작구" },
  { name: "세종대학교", campus: "서울 광진구" },
  { name: "광운대학교", campus: "서울 노원구" },
  { name: "명지대학교", campus: "서울 서대문구 · 인문캠퍼스" },
  { name: "명지대학교", campus: "경기 용인시 · 자연캠퍼스" },
  { name: "상명대학교", campus: "서울 종로구 · 서울캠퍼스" },
  { name: "상명대학교", campus: "충남 천안시 · 천안캠퍼스" },
  { name: "서울과학기술대학교", campus: "서울 노원구", aliases: ["서울과기대", "과기대", "국립서울과학기술대학교"] },
  { name: "성신여자대학교", campus: "서울 성북구", aliases: ["성신여대"] },
  { name: "서울여자대학교", campus: "서울 노원구", aliases: ["서울여대"] },
  { name: "동덕여자대학교", campus: "서울 성북구", aliases: ["동덕여대"] },
  { name: "덕성여자대학교", campus: "서울 도봉구", aliases: ["덕성여대"] },
  { name: "한성대학교", campus: "서울 성북구" },
  { name: "서경대학교", campus: "서울 성북구" },
  { name: "삼육대학교", campus: "서울 노원구" },
  { name: "서울교육대학교", campus: "서울 서초구", aliases: ["서울교대"] },
  { name: "한국체육대학교", campus: "서울 송파구", aliases: ["한체대"] },
  { name: "한국예술종합학교", campus: "서울 성북구", aliases: ["한예종"] },
  { name: "가톨릭대학교", campus: "경기 부천시 · 성심캠퍼스", aliases: ["가대"] },
  { name: "가톨릭대학교", campus: "서울 서초구 · 성의교정", aliases: ["가대"] },
  { name: "성공회대학교", campus: "서울 구로구" },
  { name: "총신대학교", campus: "서울 동작구" },
  { name: "감리교신학대학교", campus: "서울 서대문구", aliases: ["감신대"] },
  { name: "장로회신학대학교", campus: "서울 광진구", aliases: ["장신대"] },
  { name: "추계예술대학교", campus: "서울 서대문구", aliases: ["추계예대"] },
  { name: "서울한영대학교", campus: "서울 양천구" },
  { name: "서울기독대학교", campus: "서울 은평구" },
  { name: "KC대학교", campus: "서울 강서구" },
  { name: "한국성서대학교", campus: "서울 노원구" },
  { name: "한국방송통신대학교", campus: "서울 종로구", aliases: ["방송대", "방통대"] },
  { name: "육군사관학교", campus: "서울 노원구", aliases: ["육사"] },

  // 과학기술원
  { name: "한국과학기술원", campus: "대전 유성구", aliases: ["KAIST", "카이스트"] },
  { name: "포항공과대학교", campus: "경북 포항시", aliases: ["POSTECH", "포스텍", "포항공대"] },
  { name: "광주과학기술원", campus: "광주 북구", aliases: ["GIST", "지스트"] },
  { name: "대구경북과학기술원", campus: "대구 달성군", aliases: ["DGIST", "디지스트"] },
  { name: "울산과학기술원", campus: "울산 울주군", aliases: ["UNIST", "유니스트"] },
  { name: "한국에너지공과대학교", campus: "전남 나주시", aliases: ["KENTECH", "켄텍", "한전공대"] },

  // 경기 · 인천
  { name: "인하대학교", campus: "인천 미추홀구" },
  { name: "아주대학교", campus: "경기 수원시" },
  { name: "인천대학교", campus: "인천 연수구", aliases: ["국립인천대학교"] },
  { name: "가천대학교", campus: "경기 성남시 · 글로벌캠퍼스" },
  { name: "가천대학교", campus: "인천 연수구 · 메디컬캠퍼스" },
  { name: "단국대학교", campus: "경기 용인시 · 죽전캠퍼스", aliases: ["단대"] },
  { name: "단국대학교", campus: "충남 천안시 · 천안캠퍼스", aliases: ["단대"] },
  { name: "한국항공대학교", campus: "경기 고양시", aliases: ["항공대"] },
  { name: "경기대학교", campus: "경기 수원시 · 수원캠퍼스" },
  { name: "경기대학교", campus: "서울 서대문구 · 서울캠퍼스" },
  { name: "한국공학대학교", campus: "경기 시흥시", aliases: ["한국공대", "산기대", "한국산업기술대학교"] },
  { name: "한경국립대학교", campus: "경기 안성시", aliases: ["한경대"] },
  { name: "경인교육대학교", campus: "인천 계양구", aliases: ["경인교대"] },
  { name: "강남대학교", campus: "경기 용인시" },
  { name: "용인대학교", campus: "경기 용인시" },
  { name: "수원대학교", campus: "경기 화성시" },
  { name: "협성대학교", campus: "경기 화성시" },
  { name: "한신대학교", campus: "경기 오산시" },
  { name: "평택대학교", campus: "경기 평택시" },
  { name: "안양대학교", campus: "경기 안양시" },
  { name: "한세대학교", campus: "경기 군포시" },
  { name: "대진대학교", campus: "경기 포천시" },
  { name: "차의과학대학교", campus: "경기 포천시", aliases: ["차의과대"] },
  { name: "신한대학교", campus: "경기 의정부시" },
  { name: "을지대학교", campus: "경기 성남시" },
  { name: "서울신학대학교", campus: "경기 부천시" },
  { name: "서울장신대학교", campus: "경기 광주시" },
  { name: "루터대학교", campus: "경기 용인시" },
  { name: "칼빈대학교", campus: "경기 용인시" },
  { name: "아세아연합신학대학교", campus: "경기 포천시" },
  { name: "중앙승가대학교", campus: "경기 김포시" },
  { name: "인천가톨릭대학교", campus: "인천 연수구" },

  // 강원
  { name: "강원대학교", campus: "강원 춘천시 · 춘천캠퍼스", aliases: ["국립강원대학교"] },
  { name: "강원대학교", campus: "강원 삼척시 · 삼척캠퍼스", aliases: ["국립강원대학교"] },
  { name: "강원대학교", campus: "강원 강릉시 · 강릉캠퍼스", aliases: ["국립강원대학교", "강릉원주대학교"] },
  { name: "강원대학교", campus: "강원 원주시 · 원주캠퍼스", aliases: ["국립강원대학교", "강릉원주대학교"] },
  { name: "한림대학교", campus: "강원 춘천시" },
  { name: "춘천교육대학교", campus: "강원 춘천시", aliases: ["춘천교대"] },
  { name: "가톨릭관동대학교", campus: "강원 강릉시", aliases: ["관동대"] },
  { name: "상지대학교", campus: "강원 원주시" },
  { name: "한라대학교", campus: "강원 원주시" },
  { name: "경동대학교", campus: "강원 고성군" },

  // 대전 · 세종 · 충남
  { name: "충남대학교", campus: "대전 유성구", aliases: ["국립충남대학교"] },
  { name: "한밭대학교", campus: "대전 유성구", aliases: ["국립한밭대학교"] },
  { name: "한남대학교", campus: "대전 대덕구" },
  { name: "대전대학교", campus: "대전 동구" },
  { name: "배재대학교", campus: "대전 서구" },
  { name: "목원대학교", campus: "대전 서구" },
  { name: "우송대학교", campus: "대전 동구" },
  { name: "침례신학대학교", campus: "대전 유성구", aliases: ["침신대"] },
  { name: "국군간호사관학교", campus: "대전 유성구", aliases: ["간호사관학교"] },
  { name: "공주대학교", campus: "충남 공주시", aliases: ["국립공주대학교"] },
  { name: "공주교육대학교", campus: "충남 공주시", aliases: ["공주교대"] },
  { name: "순천향대학교", campus: "충남 아산시" },
  { name: "호서대학교", campus: "충남 아산시" },
  { name: "선문대학교", campus: "충남 아산시" },
  { name: "경찰대학", campus: "충남 아산시", aliases: ["경찰대"] },
  { name: "백석대학교", campus: "충남 천안시" },
  { name: "남서울대학교", campus: "충남 천안시" },
  { name: "나사렛대학교", campus: "충남 천안시" },
  { name: "한국기술교육대학교", campus: "충남 천안시", aliases: ["한기대", "코리아텍", "KOREATECH"] },
  { name: "건양대학교", campus: "충남 논산시" },
  { name: "금강대학교", campus: "충남 논산시" },
  { name: "중부대학교", campus: "충남 금산군" },
  { name: "청운대학교", campus: "충남 홍성군" },
  { name: "한서대학교", campus: "충남 서산시" },
  { name: "한국전통문화대학교", campus: "충남 부여군", aliases: ["전통문화대"] },

  // 충북
  { name: "충북대학교", campus: "충북 청주시", aliases: ["국립충북대학교"] },
  { name: "청주대학교", campus: "충북 청주시" },
  { name: "서원대학교", campus: "충북 청주시" },
  { name: "청주교육대학교", campus: "충북 청주시", aliases: ["청주교대"] },
  { name: "한국교원대학교", campus: "충북 청주시", aliases: ["교원대"] },
  { name: "꽃동네대학교", campus: "충북 청주시" },
  { name: "공군사관학교", campus: "충북 청주시", aliases: ["공사"] },
  { name: "한국교통대학교", campus: "충북 충주시", aliases: ["교통대", "국립한국교통대학교"] },
  { name: "세명대학교", campus: "충북 제천시" },
  { name: "극동대학교", campus: "충북 음성군" },
  { name: "중원대학교", campus: "충북 괴산군" },
  { name: "유원대학교", campus: "충북 영동군" },

  // 전북
  { name: "전북대학교", campus: "전북 전주시", aliases: ["국립전북대학교"] },
  { name: "전주대학교", campus: "전북 전주시" },
  { name: "전주교육대학교", campus: "전북 전주시", aliases: ["전주교대"] },
  { name: "예수대학교", campus: "전북 전주시" },
  { name: "원광대학교", campus: "전북 익산시" },
  { name: "우석대학교", campus: "전북 완주군" },
  { name: "한일장신대학교", campus: "전북 완주군" },
  { name: "군산대학교", campus: "전북 군산시", aliases: ["국립군산대학교"] },
  { name: "호원대학교", campus: "전북 군산시" },
  { name: "예원예술대학교", campus: "전북 임실군" },

  // 광주 · 전남
  { name: "전남대학교", campus: "광주 북구 · 광주캠퍼스", aliases: ["국립전남대학교"] },
  { name: "전남대학교", campus: "전남 여수시 · 여수캠퍼스", aliases: ["국립전남대학교"] },
  { name: "조선대학교", campus: "광주 동구" },
  { name: "광주교육대학교", campus: "광주 북구", aliases: ["광주교대"] },
  { name: "광주대학교", campus: "광주 남구" },
  { name: "호남대학교", campus: "광주 광산구" },
  { name: "광주여자대학교", campus: "광주 광산구", aliases: ["광주여대"] },
  { name: "남부대학교", campus: "광주 광산구" },
  { name: "송원대학교", campus: "광주 남구" },
  { name: "광신대학교", campus: "광주 북구" },
  { name: "순천대학교", campus: "전남 순천시", aliases: ["국립순천대학교"] },
  { name: "목포대학교", campus: "전남 무안군", aliases: ["국립목포대학교"] },
  { name: "목포해양대학교", campus: "전남 목포시", aliases: ["국립목포해양대학교"] },
  { name: "동신대학교", campus: "전남 나주시" },
  { name: "세한대학교", campus: "전남 영암군" },
  { name: "초당대학교", campus: "전남 무안군" },

  // 대구 · 경북
  { name: "경북대학교", campus: "대구 북구 · 대구캠퍼스", aliases: ["국립경북대학교"] },
  { name: "경북대학교", campus: "경북 상주시 · 상주캠퍼스", aliases: ["국립경북대학교"] },
  { name: "계명대학교", campus: "대구 달서구" },
  { name: "대구교육대학교", campus: "대구 남구", aliases: ["대구교대"] },
  { name: "영남대학교", campus: "경북 경산시" },
  { name: "대구대학교", campus: "경북 경산시" },
  { name: "대구가톨릭대학교", campus: "경북 경산시", aliases: ["대가대"] },
  { name: "대구한의대학교", campus: "경북 경산시" },
  { name: "경일대학교", campus: "경북 경산시" },
  { name: "대구예술대학교", campus: "경북 칠곡군" },
  { name: "금오공과대학교", campus: "경북 구미시", aliases: ["금오공대", "국립금오공과대학교"] },
  { name: "경운대학교", campus: "경북 구미시" },
  { name: "한동대학교", campus: "경북 포항시" },
  { name: "위덕대학교", campus: "경북 경주시" },
  { name: "국립경국대학교", campus: "경북 안동시", aliases: ["경국대", "안동대학교"] },
  { name: "동양대학교", campus: "경북 영주시" },
  { name: "김천대학교", campus: "경북 김천시" },

  // 부산 · 울산 · 경남
  { name: "부산대학교", campus: "부산 금정구 · 부산캠퍼스", aliases: ["부대", "국립부산대학교"] },
  { name: "부산대학교", campus: "경남 양산시 · 양산캠퍼스", aliases: ["부대", "국립부산대학교"] },
  { name: "부산대학교", campus: "경남 밀양시 · 밀양캠퍼스", aliases: ["부대", "국립부산대학교"] },
  { name: "부경대학교", campus: "부산 남구", aliases: ["국립부경대학교"] },
  { name: "한국해양대학교", campus: "부산 영도구", aliases: ["해양대", "국립한국해양대학교"] },
  { name: "부산교육대학교", campus: "부산 연제구", aliases: ["부산교대"] },
  { name: "동아대학교", campus: "부산 사하구" },
  { name: "동의대학교", campus: "부산 부산진구" },
  { name: "경성대학교", campus: "부산 남구" },
  { name: "동명대학교", campus: "부산 남구" },
  { name: "신라대학교", campus: "부산 사상구" },
  { name: "동서대학교", campus: "부산 사상구" },
  { name: "부산외국어대학교", campus: "부산 금정구", aliases: ["부산외대"] },
  { name: "부산가톨릭대학교", campus: "부산 금정구" },
  { name: "고신대학교", campus: "부산 영도구" },
  { name: "울산대학교", campus: "울산 남구" },
  { name: "경상국립대학교", campus: "경남 진주시", aliases: ["경상대", "경상대학교"] },
  { name: "진주교육대학교", campus: "경남 진주시", aliases: ["진주교대"] },
  { name: "창원대학교", campus: "경남 창원시", aliases: ["국립창원대학교"] },
  { name: "경남대학교", campus: "경남 창원시" },
  { name: "창신대학교", campus: "경남 창원시" },
  { name: "해군사관학교", campus: "경남 창원시", aliases: ["해사"] },
  { name: "인제대학교", campus: "경남 김해시" },
  { name: "가야대학교", campus: "경남 김해시" },
  { name: "영산대학교", campus: "경남 양산시" },

  // 제주
  { name: "제주대학교", campus: "제주 제주시", aliases: ["국립제주대학교"] },
  { name: "제주국제대학교", campus: "제주 제주시" },
];

export type UniversityHit = University & {
  /** The name split for highlighting: `match` is tinted, `before` / `rest` are not. */
  before: string;
  match: string;
  rest: string;
};

/** Spaces and case don't count: "kaist", "서울 대" still find their school. */
function normalize(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

/**
 * Ranks the catalogue for a query, best first:
 *   1. the name starts with it ("성균" → 성균관대학교)
 *   2. a nickname or the full name does ("연대", "이화여대", "카이스트", "국립부경")
 *   3. the name contains it ("외국어" → 한국외국어대학교)
 *   4. the campus does ("부산", "수원시")
 *   5. the name shares its first letters ("성균" → 성결 on its shared "성")
 * — tier 1 and 5 together are the 7-1 frame's "성균" list.
 */
export function searchUniversities(query: string, limit = 3): UniversityHit[] {
  const q = normalize(query);
  if (!q) return [];
  const hits: { hit: UniversityHit; tier: number; n: number; i: number }[] = [];
  UNIVERSITIES.forEach((u, i) => {
    const name = normalize(u.name);
    const hit = (start: number, length: number): UniversityHit => ({
      ...u,
      before: u.name.slice(0, start),
      match: u.name.slice(start, start + length),
      rest: u.name.slice(start + length),
    });
    if (name.startsWith(q)) return hits.push({ hit: hit(0, q.length), tier: 1, n: q.length, i });
    if (u.aliases?.some((a) => normalize(a).startsWith(q))) {
      return hits.push({ hit: hit(0, 0), tier: 2, n: 0, i });
    }
    const at = name.indexOf(q);
    if (at > 0) return hits.push({ hit: hit(at, q.length), tier: 3, n: q.length, i });
    if (normalize(u.campus).includes(q)) return hits.push({ hit: hit(0, 0), tier: 4, n: 0, i });
    let n = 0;
    while (n < q.length && name[n] === q[n]) n++;
    if (n > 0) hits.push({ hit: hit(0, n), tier: 5, n, i });
  });
  return hits
    .sort((a, b) => a.tier - b.tier || b.n - a.n || a.i - b.i)
    .slice(0, limit)
    .map((h) => h.hit);
}
