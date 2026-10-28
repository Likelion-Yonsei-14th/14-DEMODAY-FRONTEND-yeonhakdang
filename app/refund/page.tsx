import type { Metadata } from "next";

import { RefundBody } from "@/components/public/PolicyBody";
import { PublicShell } from "@/components/public/PublicShell";
import { REFUND } from "@/lib/policies";

export const metadata: Metadata = {
  title: REFUND.title,
  description: REFUND.description,
};

export default function RefundPage() {
  return (
    <PublicShell>
      <RefundBody />
    </PublicShell>
  );
}
