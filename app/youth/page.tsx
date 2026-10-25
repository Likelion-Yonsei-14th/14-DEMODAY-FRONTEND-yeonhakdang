import type { Metadata } from "next";

import { PolicyBody } from "@/components/public/PolicyBody";
import { PublicShell } from "@/components/public/PublicShell";
import { YOUTH } from "@/lib/policies";

export const metadata: Metadata = {
  title: YOUTH.title,
  description: YOUTH.description,
};

export default function YouthPage() {
  return (
    <PublicShell>
      <PolicyBody doc={YOUTH} />
    </PublicShell>
  );
}
