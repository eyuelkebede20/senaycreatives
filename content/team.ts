// content/team.ts — the team. Edit these freely; the Team page renders from here.
//
// Two groups:
//   • coreTeam     — the 5 core/leadership members (featured, larger cards)
//   • extendedTeam — everyone else; can grow long, rendered by mapping the array
//
// Each member: name, role, bio, optional photo, optional `link` (a profile/portfolio
// the name links to), and optional `socials` (icons render ONLY for entries present).

import type { SocialLink } from "@/content/contact";

export type Member = {
  name: string;
  role: string;
  bio: string;
  /** Stored under /public/team/… — a placeholder avatar shows until it exists. */
  photo?: string;
  /** Optional: clicking the name/photo opens this (personal site, LinkedIn, etc.). */
  link?: string;
  /** Optional: per-person social icons. Omit or leave [] to show none. */
  socials?: SocialLink[];
  placeholder?: boolean;
};

/** The 5 core members. Keep this to the leadership/core team. */
export const coreTeam: Member[] = [
  {
    name: "Senay [Founder]",
    role: "Founder & Creative Director",
    bio: "Sets the creative bar and makes sure every project actually solves the client's problem.",
    photo: "/team/placeholder-1.svg",
    link: "",
    socials: [
      { platform: "linkedin", href: "https://linkedin.com/" },
      { platform: "x", href: "https://x.com/" },
    ],
    placeholder: true,
  },
  {
    name: "[Lead Engineer]",
    role: "Lead Engineer",
    bio: "Builds it properly — fast, accessible, and maintainable long after launch.",
    photo: "/team/placeholder-2.svg",
    socials: [{ platform: "github", href: "https://github.com/" }],
    placeholder: true,
  },
  {
    name: "[Product Designer]",
    role: "Product Designer",
    bio: "Shapes the look and the flow so the work feels effortless to use.",
    photo: "/team/placeholder-3.svg",
    placeholder: true,
  },
  {
    name: "[Growth Lead]",
    role: "Growth & Marketing",
    bio: "Turns a great build into steady growth across the channels that matter.",
    photo: "/team/placeholder-4.svg",
    placeholder: true,
  },
  {
    name: "[Operations Lead]",
    role: "Operations & Delivery",
    bio: "Keeps projects on track and clients in the loop from kickoff to launch.",
    photo: "/team/placeholder-5.svg",
    placeholder: true,
  },
];

/** Everyone else. This list can be long — the page maps over it. */
export const extendedTeam: Member[] = [
  {
    name: "[Frontend Developer]",
    role: "Frontend Developer",
    bio: "Turns designs into crisp, responsive interfaces.",
    placeholder: true,
  },
  {
    name: "[Content Strategist]",
    role: "Content & Copy",
    bio: "Writes the words that make the work land.",
    placeholder: true,
  },
];
