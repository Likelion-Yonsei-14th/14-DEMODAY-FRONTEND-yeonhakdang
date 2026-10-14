import type { Metadata, Viewport } from "next";

import { ProtoLoader } from "@/components/proto/ProtoLoader";

export const metadata: Metadata = {
  title: "연학당",
  description: "타고난 사주로 나의 학과를 찾다",
};

/** A mobile web app: fit the device, no pinch zoom, paint under the notch. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#faf8f3",
};

export default function ProtoPage() {
  return <ProtoLoader />;
}
