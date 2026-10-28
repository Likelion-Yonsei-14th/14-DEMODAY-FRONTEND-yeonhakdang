import type { Metadata } from "next";

import { PolicyBody } from "@/components/public/PolicyBody";
import { PublicShell } from "@/components/public/PublicShell";
import { TERMS } from "@/lib/policies";

export const metadata: Metadata = {
  title: TERMS.title,
  description: TERMS.description,
};

export default function TermsPage() {
  return (
    <PublicShell>
      <PolicyBody doc={TERMS} />
    </PublicShell>
  );
}
