"use client";

import { useEffect } from "react";

/**
 * Any unknown path lands on the prototype's own 404 frame (9-3), whose
 * "첫 화면으로 가기" then works from the real root URL.
 */
export default function NotFound() {
  useEffect(() => {
    window.location.replace("/#9-3");
  }, []);
  return <div className="fixed inset-0 bg-bg-base" />;
}
