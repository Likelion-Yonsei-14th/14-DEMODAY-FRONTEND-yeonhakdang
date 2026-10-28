import type { Metadata } from "next";
import { PublicPage } from "@/components/proto/PublicPage";
import { ProductCompat } from "@/components/screens/06-product/ProductCompat";

export const metadata: Metadata = { title: "합격 궁합 · 연학당" };

export default function Page() {
  return <PublicPage product="compat"><ProductCompat /></PublicPage>;
}

