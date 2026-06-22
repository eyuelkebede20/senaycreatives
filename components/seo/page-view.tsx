"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a best-effort page-view beacon on each public navigation. Excludes
// bots without JS by design; the /api/track route ignores admin/api paths.
export function PageView() {
  const pathname = usePathname();
  useEffect(() => {
    const body = JSON.stringify({ path: pathname });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
      }
    } catch {
      // ignore — analytics is non-critical
    }
  }, [pathname]);
  return null;
}
