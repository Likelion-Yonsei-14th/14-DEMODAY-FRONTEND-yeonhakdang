import type { Metadata } from "next";
import { PublicPage } from "@/components/proto/PublicPage";
import { TermsPage } from "@/components/policy/PolicyPages";

export const metadata: Metadata = { title: "이용약관 · 연학당" };

export default function Page() {
  return <PublicPage><TermsPage /></PublicPage>;
}

