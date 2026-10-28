"use client";

import { ShareScreen } from "./ShareScreen";

/** Legacy deep link now uses the real exporter and generated-image viewer. */
export function SaveImageGuide() {
  return <ShareScreen initialCard="major" initialRatio="스토리 9:16" />;
}
