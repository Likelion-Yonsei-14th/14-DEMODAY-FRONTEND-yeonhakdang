import type { Metadata } from "next";
import { PublicPage } from "@/components/proto/PublicPage";
import { ProductBenefactor } from "@/components/screens/06-product/ProductBenefactor";

export const metadata: Metadata = { title: "귀인 · 연학당" };

export default function Page() {
  return <PublicPage product="benefactor"><ProductBenefactor /></PublicPage>;
}

