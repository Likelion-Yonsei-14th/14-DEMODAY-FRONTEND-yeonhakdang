import type { Metadata } from "next";
import { PublicPage } from "@/components/proto/PublicPage";
import { PrivacyPage } from "@/components/policy/PolicyPages";

export const metadata: Metadata = { title: "개인정보처리방침 · 연학당" };

export default function Page() {
  return <PublicPage><PrivacyPage /></PublicPage>;
}

