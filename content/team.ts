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

/** The core/leadership team. Photos live in /public/team (optimized JPEGs). */
export const coreTeam: Member[] = [
  {
    name: "Bruk M.",
    role: "General Manager",
    bio: "Runs the studio day to day — keeps projects on track and clients in the loop from kickoff to launch.",
    photo: "/team/bruk-m.jpg",
  },
  {
    name: "Andualem G.",
    role: "Senior Developer",
    bio: "Builds it properly — fast, accessible, and maintainable long after launch.",
    photo: "/team/andualem-g.jpg",
  },
  {
    name: "Dagmawit W.",
    role: "Marketing Manager",
    bio: "Turns a great build into steady growth across the channels that matter.",
    // photo pending — the uploaded file duplicated andualem-g's image; avatar shows until then.
  },
  {
    name: "Hailamlak D.",
    role: "Full Stack Developer",
    bio: "Ships end to end — from the database to the last pixel of the interface.",
    photo: "/team/hailamlak-d.jpg",
  },
];

/** Everyone else. This list can be long — the page maps over it. */
export const extendedTeam: Member[] = [];
