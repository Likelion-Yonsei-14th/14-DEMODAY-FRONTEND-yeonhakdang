import type { ProtoState } from "./proto";

/** Start a different analysis without logging out or deleting purchase/payment records. */
export function freshAnalysis(state: ProtoState): ProtoState {
  return {
    ...state,
    name: "",
    birth: "",
    gender: 0,
    calendar: 0,
    leapMonth: false,
    time: "",
    unknownTime: false,
    analyzed: false,
    analysisOwner: state.account,
    savedResult: null,
    inviter: null,
    friends: state.account ? state.friends : [],
    rosterSeenAt: state.account ? state.rosterSeenAt : 0,
    friend: "",
    afterInput: null,
    afterLogin: "2-1",
    loginPending: false,
  };
}
