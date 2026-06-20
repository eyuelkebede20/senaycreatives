// content/contact.ts — SINGLE SOURCE OF TRUTH for brand contact details.
// Edit these once; they feed the email templates, the team social icons, the
// site footer, and the LocalBusiness structured data. No other file should
// hardcode a phone number, email, or social URL.

import { SITE_URL } from "@/lib/site";

/** Supported social platforms. Add one here + an icon in social-icons.tsx. */
export type SocialPlatform =
  | "instagram"
  | "linkedin"
  | "x"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "github"
  | "telegram"
  | "website";

export type SocialLink = { platform: SocialPlatform; href: string };

export const contact = {
  name: "SenayCreatives",
  // Public-facing contact. ← EDIT THESE.
  phone: "+251 900 000 000", // placeholder — replace with the real number
  phoneHref: "tel:+251900000000", // digits only, no spaces
  email: "hello@senaycreatives.com",
  address: {
    city: "Addis Ababa",
    country: "Ethiopia",
    countryCode: "ET",
  },
  url: SITE_URL,
  // Absolute logo URL (emails need absolute, not relative, paths).
  logo: `${SITE_URL}/logo-mark.png`,

  // Brand-level socials (footer + email signature). Leave only the ones you use;
  // icons render only for entries that are present.
  socials: [
    { platform: "instagram", href: "https://instagram.com/" },
    { platform: "linkedin", href: "https://linkedin.com/" },
    { platform: "x", href: "https://x.com/" },
  ] satisfies SocialLink[],
} as const;
