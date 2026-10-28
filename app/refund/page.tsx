import type { Metadata } from "next";
import { PublicPage } from "@/components/proto/PublicPage";
import { RefundPolicy } from "@/components/screens/10-policy/RefundPolicy";

export const metadata: Metadata = { title: "환불 정책 · 연학당" };

export default function Page() {
  return <PublicPage><RefundPolicy /></PublicPage>;
}

