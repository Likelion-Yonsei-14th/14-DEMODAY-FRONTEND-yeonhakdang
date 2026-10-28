import type { Metadata } from "next";

import { PolicyBody } from "@/components/public/PolicyBody";
import { PublicShell } from "@/components/public/PublicShell";
import { PRIVACY } from "@/lib/policies";

export const metadata: Metadata = {
  title: PRIVACY.title,
  description: PRIVACY.description,
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PolicyBody doc={PRIVACY} />
    </PublicShell>
  );
}
