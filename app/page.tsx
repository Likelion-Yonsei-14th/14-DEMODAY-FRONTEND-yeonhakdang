import type { Metadata, Viewport } from "next";

import { ProtoLoader } from "@/components/proto/ProtoLoader";

export const metadata: Metadata = {
  title: "연학당 · 프로토타입",
  description: "버튼을 눌러 유저 플로우대로 이동하는 스마트폰 프로토타입",
};

/** A phone prototype: fit the device, no pinch zoom, paint under the notch. */
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
