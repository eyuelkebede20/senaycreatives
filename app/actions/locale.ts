"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/i18n";
import { locales, type Locale } from "@/content/i18n";

/** Persist the chosen UI locale in a cookie (1 year). */
export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
