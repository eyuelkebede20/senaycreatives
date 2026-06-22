import "server-only";
import { cookies } from "next/headers";
import { dict, defaultLocale, locales, type Locale } from "@/content/i18n";

export const LOCALE_COOKIE = "sc_locale";

/** Current UI locale from the cookie (defaults to English). */
export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return (locales as readonly string[]).includes(v ?? "") ? (v as Locale) : defaultLocale;
}

/** The translation dictionary for the current locale. */
export async function getDict() {
  return dict[await getLocale()];
}
