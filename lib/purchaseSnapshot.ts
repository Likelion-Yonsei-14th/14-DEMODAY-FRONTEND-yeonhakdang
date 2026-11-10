import type { ProtoState, ProductKind } from "./proto";
import type { BenefactorResult, CharmResult, CompatResult } from "./saju/paid.ts";

export type PurchaseInput = Pick<ProtoState, "name" | "birth" | "gender" | "calendar" | "leapMonth" | "time" | "unknownTime">;
export type PaidResults = { compat: CompatResult; benefactor: BenefactorResult; charm: CharmResult };
export type PurchaseSnapshot = {
  version: 1; input: PurchaseInput; universities: string[]; relation: string;
  results: Partial<PaidResults>; charmVariants: CharmResult[];
};
export type SavedPaidResult = {
  orderId: string; kind: ProductKind; version: 1; input: PurchaseInput;
  relation: string; result: PaidResults[ProductKind]; charmRerolls: number;
};
export function savedFor<K extends ProductKind>(records: Partial<Record<ProductKind, SavedPaidResult>> | undefined, orders: Partial<Record<ProductKind, string>>, kind: K): PaidResults[K] | null {
  const record = records?.[kind];
  return record && record.orderId === orders[kind] && record.kind === kind ? record.result as PaidResults[K] : null;
}
