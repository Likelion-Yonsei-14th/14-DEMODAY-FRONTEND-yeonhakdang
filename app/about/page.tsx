import type { Metadata } from "next";
import { PublicPage } from "@/components/proto/PublicPage";
import { AboutPage } from "@/components/policy/PolicyPages";

export const metadata: Metadata = { title: "서비스 소개 · 연학당" };

export default function Page() {
  return <PublicPage><AboutPage /></PublicPage>;
}

