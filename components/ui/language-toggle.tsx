"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import { locales, localeNames, type Locale } from "@/content/i18n";
import { cn } from "@/lib/utils";

/** EN / አማ switch. Sets the locale cookie and refreshes to re-render in it. */
export function LanguageToggle({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function pick(l: Locale) {
    if (l === current) return;
    startTransition(async () => {
      await setLocale(l);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center rounded-full border border-line p-0.5 text-xs" role="group" aria-label="Language">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          disabled={pending}
          aria-pressed={l === current}
          className={cn(
            "rounded-full px-2 py-1 font-medium transition-colors disabled:opacity-60",
            l === current ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
          )}
        >
          {localeNames[l]}
        </button>
      ))}
    </div>
  );
}
