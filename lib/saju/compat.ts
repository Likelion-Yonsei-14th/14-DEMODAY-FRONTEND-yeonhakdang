/**
 * 친구 궁합: two analyses → a 60~98 score, the 오행 relation behind it, and
 * the 석차 rules. Pure and symmetric — swapping the two people gives the same
 * score — so a server can run it unchanged once friends live in a database.
 */
import { josa } from "../josa.ts";
import type { Analysis } from "./analyze.ts";
import { ELEMENTS, ELEMENT_HANJA, elementLabel, generates, type Element, type ElementCounts } from "./elements.ts";

/** How my 일간 relates to my friend's. */
export type Relation = "feeds" | "fed" | "same" | "controls" | "controlled";

export type Compat = {
  score: number;
  relation: Relation;
  /** "木 生 火" */
  formula: string;
  /** "나무가 불을 살리는 상생" */
  caption: string;
  /** The 관계 유형 chip. */
  kind: string;
  /** "왜 ○점일까?" */
  reasons: string[];
};

export const COMPAT_MIN = 60;
export const COMPAT_MAX = 98;

const RELATION_POINTS: Record<Relation, number> = {
  feeds: 1,
  fed: 1,
  same: 0.75,
  controls: 0.35,
  controlled: 0.35,
};
/** 일간 관계 vs. 서로의 약한 기운을 채워 주는지. */
const RELATION_WEIGHT = 0.6;
const COMPLEMENT_WEIGHT = 0.4;
/** Having this many of the other's weakest element fills it completely. */
const FULL_FILL = 2;

const NATURE: Record<Element, string> = { 목: "나무", 화: "불", 토: "흙", 금: "쇠", 수: "물" };
const CONTROL_VERB: Record<Element, string> = {
  목: "누르는",
  화: "녹이는",
  토: "막는",
  금: "베는",
  수: "끄는",
};
const KIND: Record<Relation, string> = {
  feeds: "서로 키워 주는 동기",
  fed: "서로 키워 주는 동기",
  same: "결이 닮은 동기",
  controls: "자극을 주는 동기",
  controlled: "자극을 주는 동기",
};

/** 상극: 목→토→수→화→금→목 — the element `e` keeps in check. */
function controls(e: Element): Element {
  return ELEMENTS[(ELEMENTS.indexOf(e) + 2) % ELEMENTS.length];
}

export function relationOf(me: Element, friend: Element): Relation {
  if (me === friend) return "same";
  if (generates(me) === friend) return "feeds";
  if (generates(friend) === me) return "fed";
  return controls(me) === friend ? "controls" : "controlled";
}

/** "목(木)을" / "화(火)를" — the 조사 follows the 한글 name. */
function labelObj(e: Element): string {
  return elementLabel(e) + josa(e, "을/를").slice(e.length);
}

function fill(weak: Element, giver: ElementCounts): number {
  return Math.min(1, giver[weak] / FULL_FILL);
}

export function compatibility(me: Analysis, friend: Analysis, friendName: string): Compat {
  const a = me.saju.dayMaster.element;
  const b = friend.saju.dayMaster.element;
  const relation = relationOf(a, b);
  const iFillFriend = fill(friend.weakest, me.counts);
  const friendFillsMe = fill(me.weakest, friend.counts);
  const total =
    RELATION_WEIGHT * RELATION_POINTS[relation] + (COMPLEMENT_WEIGHT * (iFillFriend + friendFillsMe)) / 2;
  const score = Math.round(COMPAT_MIN + (COMPAT_MAX - COMPAT_MIN) * total);

  const [giver, taker] = relation === "fed" || relation === "controlled" ? [b, a] : [a, b];
  const formula =
    relation === "same"
      ? `${ELEMENT_HANJA[a]} 比和 ${ELEMENT_HANJA[b]}`
      : `${ELEMENT_HANJA[giver]} ${relation === "feeds" || relation === "fed" ? "生" : "克"} ${ELEMENT_HANJA[taker]}`;
  const caption =
    relation === "same"
      ? `같은 ${NATURE[a]} 기운끼리 닮은 비화`
      : relation === "feeds" || relation === "fed"
        ? `${josa(NATURE[giver], "이/가")} ${josa(NATURE[taker], "을/를")} 살리는 상생`
        : `${josa(NATURE[giver], "이/가")} ${josa(NATURE[taker], "을/를")} ${CONTROL_VERB[giver]} 상극`;

  const relationReason = {
    feeds: `내 ${elementLabel(a)} 기운이 ${friendName}의 ${labelObj(b)} 키워 주는 상생 관계예요.`,
    fed: `${friendName}의 ${elementLabel(b)} 기운이 내 ${labelObj(a)} 키워 주는 상생 관계예요.`,
    same: `둘 다 ${elementLabel(a)} 일간이라 생각의 결이 비슷한 비화 관계예요.`,
    controls: `내 ${elementLabel(a)} 기운이 ${friendName}의 ${labelObj(b)} ${CONTROL_VERB[a]} 상극이라, 서로 속도를 맞추면 더 좋아요.`,
    controlled: `${friendName}의 ${elementLabel(b)} 기운이 내 ${labelObj(a)} ${CONTROL_VERB[b]} 상극이라, 서로 속도를 맞추면 더 좋아요.`,
  }[relation];
  const complementReason =
    friendFillsMe > 0 && friendFillsMe >= iFillFriend
      ? `${friendName}에게 있는 ${elementLabel(me.weakest)} 기운이 내게 부족한 기운을 채워 줘요.`
      : iFillFriend > 0
        ? `내게 있는 ${elementLabel(friend.weakest)} 기운이 ${friendName}에게 부족한 기운을 채워 줘요.`
        : "서로 부족한 기운을 직접 채우진 않아서, 함께 채워 갈 부분이 있어요.";
  const teamReason = `팀플에서는 ${me.dayMaster.type}인 나와 ${friend.dayMaster.type}인 ${friendName}, 서로 다른 강점으로 역할을 나눠 봐요.`;

  return { score, relation, formula, caption, kind: KIND[relation], reasons: [relationReason, complementReason, teamReason] };
}

/** The 석차 labels, best first. */
export type Rank = "수석 동기" | "차석" | "합격" | "추가 합격";
/** From 3위 on, a score under this is 추가 합격. */
export const WAITLIST_BELOW = 70;

/** 궁합 점수 내림차순; 동점이면 먼저 등록한 친구가 앞. */
export function rankFriends<T extends { score: number; addedAt: number }>(items: T[]): Array<T & { rank: Rank }> {
  return [...items]
    .sort((x, y) => y.score - x.score || x.addedAt - y.addedAt)
    .map((item, i) => ({
      ...item,
      rank: i === 0 ? "수석 동기" : i === 1 ? "차석" : item.score < WAITLIST_BELOW ? "추가 합격" : "합격",
    }));
}
