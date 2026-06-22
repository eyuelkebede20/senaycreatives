// content/i18n.ts — UI translations (English + Amharic).
//
// HOW TO EDIT: change any string below. `en` is the source of truth for the
// shape; `am` must have the same keys (TypeScript enforces it via `satisfies`).
// To translate more of the site, add a key here and use it in the component via
// the dictionary (see lib/i18n.ts → getDict). Blog *posts* are translated in the
// admin (each post has optional Amharic fields), not here.

export const locales = ["en", "am"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = { en: "EN", am: "አማ" };

type Dict = {
  nav: Record<string, string>; // keyed by path
  ctaStart: string;
  hero: { eyebrow: string; build: string; words: string[]; subtitle: string; see: string };
  services: { eyebrow: string; title: string; intro: string; see: string };
  featured: { eyebrow: string; title: string; intro: string; all: string };
  testimonials: { eyebrow: string; title: string };
  ctaSection: { title: string; body: string };
  footer: { explore: string; services: string; getInTouch: string; tagline: string; privacy: string; built: string; rights: string };
  blog: { title: string; lead: string; intro: string; searchPh: string; search: string; allPosts: string; empty: string; emptySearch: string; clear: string; results: (n: number, q: string) => string };
};

const en: Dict = {
  nav: {
    "/packages": "Packages",
    "/projects": "Projects",
    "/partners": "Partners",
    "/team": "Team",
    "/blog": "Blog",
    "/careers": "Hiring Now",
  },
  ctaStart: "Start a project",
  hero: {
    eyebrow: "Digital agency · Addis Ababa",
    build: "We build",
    words: ["apps people love", "sites that convert", "brands that mean it", "growth you can measure"],
    subtitle:
      "App development, full digitalization, marketing, and landing pages — for businesses that want to mean something online.",
    see: "See our work",
  },
  services: {
    eyebrow: "What we do",
    title: "One partner, the whole digital problem.",
    intro:
      "From a single landing page to a fully digitalized business — pick a productized package or let us scope custom software.",
    see: "See packages",
  },
  featured: {
    eyebrow: "Selected work",
    title: "Problems, solved.",
    intro: "Every project starts with the problem and ends with a measurable result.",
    all: "All projects →",
  },
  testimonials: { eyebrow: "In their words", title: "What it's like to work with us." },
  ctaSection: {
    title: "Have a problem worth solving?",
    body: "Tell us what you're trying to do. We'll come back with a plan — a package or a custom quote.",
  },
  footer: {
    explore: "Explore",
    services: "Services",
    getInTouch: "Get in touch",
    tagline: "We solve problems through digital means.",
    privacy: "Privacy",
    built: "Built by SenayCreatives.",
    rights: "All rights reserved.",
  },
  blog: {
    title: "Ideas & product notes.",
    lead: "Blog",
    intro: "What we're building, learning, and thinking about.",
    searchPh: "Search posts…",
    search: "Search",
    allPosts: "← All posts",
    empty: "No posts yet — check back soon.",
    emptySearch: "No posts match your search.",
    clear: "Clear",
    results: (n, q) => `${n} result${n === 1 ? "" : "s"} for “${q}”.`,
  },
};

const am: Dict = {
  nav: {
    "/packages": "ጥቅሎች",
    "/projects": "ስራዎች",
    "/partners": "አጋሮች",
    "/team": "ቡድን",
    "/blog": "ብሎግ",
    "/careers": "ቅጥር ክፍት ነው",
  },
  ctaStart: "ፕሮጀክት ይጀምሩ",
  hero: {
    eyebrow: "ዲጂታል ኤጀንሲ · አዲስ አበባ",
    build: "እኛ እንሰራለን",
    words: ["ሰዎች የሚወዱትን አፕ", "ውጤት የሚያመጡ ድረ-ገጾችን", "ትርጉም ያለው ብራንድ", "የሚለካ እድገት"],
    subtitle:
      "የአፕ ልማት፣ ሙሉ ዲጂታላይዜሽን፣ ማርኬቲንግ እና ማረፊያ ገጾች — በመስመር ላይ ትርጉም ሊኖራቸው ለሚፈልጉ ንግዶች።",
    see: "ስራዎቻችንን ይዩ",
  },
  services: {
    eyebrow: "የምንሰራው",
    title: "አንድ አጋር፣ ሙሉ የዲጂታል መፍትሄ።",
    intro:
      "ከአንድ ማረፊያ ገጽ እስከ ሙሉ ዲጂታል ንግድ — ዝግጁ ጥቅል ይምረጡ ወይም ብጁ ሶፍትዌር አብረን እንቅረጽ።",
    see: "ጥቅሎችን ይዩ",
  },
  featured: {
    eyebrow: "የተመረጡ ስራዎች",
    title: "ችግሮች፣ ተፈትተዋል።",
    intro: "እያንዳንዱ ፕሮጀክት ከችግሩ ይጀምራል፣ በሚለካ ውጤት ይጠናቀቃል።",
    all: "ሁሉም ስራዎች →",
  },
  testimonials: { eyebrow: "በራሳቸው አንደበት", title: "ከእኛ ጋር መስራት ምን እንደሚመስል።" },
  ctaSection: {
    title: "ሊፈታ የሚገባው ችግር አለዎት?",
    body: "ምን ማድረግ እንደሚፈልጉ ይንገሩን። ከእቅድ ጋር እንመለሳለን — ጥቅል ወይም ብጁ ዋጋ።",
  },
  footer: {
    explore: "ዳስስ",
    services: "አገልግሎቶች",
    getInTouch: "ያግኙን",
    tagline: "ችግሮችን በዲጂታል መንገድ እንፈታለን።",
    privacy: "ግላዊነት",
    built: "በSenayCreatives የተሰራ።",
    rights: "መብቱ በህግ የተጠበቀ ነው።",
  },
  blog: {
    title: "ሀሳቦች እና የምርት ማስታወሻዎች።",
    lead: "ብሎግ",
    intro: "የምንሰራውን፣ የምንማረውን እና የምናስበውን።",
    searchPh: "ጽሁፎችን ይፈልጉ…",
    search: "ፈልግ",
    allPosts: "← ሁሉም ጽሁፎች",
    empty: "እስካሁን ጽሁፍ የለም — በቅርቡ ይመለሱ።",
    emptySearch: "ከፍለጋዎ ጋር የሚዛመድ ጽሁፍ የለም።",
    clear: "አጽዳ",
    results: (n, q) => `ለ“${q}” ${n} ውጤት${n === 1 ? "" : "ዎች"}።`,
  },
};

export const dict: Record<Locale, Dict> = { en, am };
export type { Dict };
