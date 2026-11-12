import { PRODUCTS, PRODUCT_KINDS, type ProductKind } from "./catalog.ts";

type Access = { product: ProductKind; plan: string; purchased: Record<ProductKind, boolean> };
export function purchasedDestination(product: ProductKind, plan: string, purchased: Access["purchased"]): string | null {
  if (plan === "package") return PRODUCT_KINDS.every((kind) => purchased[kind]) ? "9-1" : null;
  return purchased[product] ? PRODUCTS[product].result : null;
}
/** Every entry point, including restored hashes and login return paths, respects ownership. */
export function ownedScreen(target: string, state: Access): string {
  for (const kind of PRODUCT_KINDS) {
    if (target === PRODUCTS[kind].detail) return purchasedDestination(kind, state.plan, state.purchased) ?? target;
  }
  return ["7-1", "7-2", "7-3", "7-3b"].includes(target)
    ? purchasedDestination(state.product, state.plan, state.purchased) ?? target : target;
}
