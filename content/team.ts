// content/team.ts — team members. PLACEHOLDER content; swap in real people + photos.

export type Member = {
  name: string;
  role: string;
  bio: string;
  /** Stored under /public/team/… — placeholders may not exist yet. */
  photo: string;
  placeholder?: boolean;
};

export const team: Member[] = [
  {
    name: "Senay [Founder]",
    role: "Founder & Creative Director",
    bio: "Sets the creative bar and makes sure every project actually solves the client's problem.",
    photo: "/team/placeholder-1.svg",
    placeholder: true,
  },
  {
    name: "[Lead Engineer]",
    role: "Lead Engineer",
    bio: "Builds it properly — fast, accessible, and maintainable long after launch.",
    photo: "/team/placeholder-2.svg",
    placeholder: true,
  },
  {
    name: "[Designer]",
    role: "Product Designer",
    bio: "Shapes the look and the flow so the work feels effortless to use.",
    photo: "/team/placeholder-3.svg",
    placeholder: true,
  },
  {
    name: "[Marketer]",
    role: "Growth & Marketing",
    bio: "Turns a great build into steady growth across the channels that matter.",
    photo: "/team/placeholder-4.svg",
    placeholder: true,
  },
];
