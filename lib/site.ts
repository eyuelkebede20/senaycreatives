// Site-wide config: identity, navigation, contact. Edit here, reflected everywhere.

export const site = {
  name: "SenayCreatives",
  tagline: "We solve problems through digital means.",
  email: "hello@senaycreatives.com",
  location: "Addis Ababa, Ethiopia",

  // Primary navigation (header + footer).
  nav: [
    { href: "/packages", label: "Packages" },
    { href: "/projects", label: "Projects" },
    { href: "/partners", label: "Partners" },
    { href: "/team", label: "Team" },
    { href: "/careers", label: "Hiring Now" },
  ],

  // The single conversion CTA used across the site.
  cta: { href: "/start-a-project", label: "Start a project" },

  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
    { label: "X", href: "https://x.com/" },
  ],
} as const;
