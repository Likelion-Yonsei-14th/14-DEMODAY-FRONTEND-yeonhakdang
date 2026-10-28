import type { Metadata } from "next";
import { PublicPage } from "@/components/proto/PublicPage";
import { ProductCharm } from "@/components/screens/06-product/ProductCharm";

export const metadata: Metadata = { title: "부적 · 연학당" };

export default function Page() {
  return <PublicPage product="charm"><ProductCharm /></PublicPage>;
}

