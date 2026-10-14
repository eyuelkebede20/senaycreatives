"use client";

import { useEffect } from "react";

export function PrintActionBar() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 print:hidden flex items-center gap-2 bg-black/85 backdrop-blur-md text-white p-2 rounded-xl shadow-2xl border border-white/10">
      <button
        type="button"
        onClick={() => window.print()}
        className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-medium text-xs transition-colors flex items-center gap-1.5 shadow"
      >
        <span>🖨️</span>
        <span>Print Document (A4)</span>
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white/90 transition-colors"
      >
        Close Window
      </button>
    </div>
  );
}
