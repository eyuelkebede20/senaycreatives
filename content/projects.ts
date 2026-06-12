// content/projects.ts — portfolio case studies (problem → solution → result).
// PLACEHOLDER content. Replace `placeholder: true` entries with real case studies.

export type Project = {
  slug: string;
  title: string;
  client: string;
  service: string;
  year: number;
  problem: string;
  solution: string;
  result: string;
  /** Stored under /public/projects/… — placeholders may not exist yet. */
  cover: string;
  tags: string[];
  placeholder?: boolean;
};

export const projects: Project[] = [
  {
    slug: "merkato-grocers",
    title: "Doubling repeat orders for a neighborhood grocer",
    client: "Merkato Grocers",
    service: "Full Digitalization",
    year: 2025,
    problem: "A busy grocer took every order by phone and lost track of regulars and stock.",
    solution: "We built an ordering site with Telebirr checkout, a simple inventory view, and SMS confirmations.",
    result: "Repeat orders doubled in three months and phone chaos dropped sharply.",
    cover: "/projects/placeholder-1.svg",
    tags: ["E-commerce", "Telebirr", "Inventory"],
    placeholder: true,
  },
  {
    slug: "habesha-clinic",
    title: "Cutting no-shows for a private clinic",
    client: "Habesha Clinic",
    service: "Business Website",
    year: 2024,
    problem: "Patients booked by calling a front desk that was often busy, and forgot appointments.",
    solution: "A bilingual booking site with automated reminders and a clear services directory.",
    result: "No-shows fell by a third and front-desk calls dropped meaningfully.",
    cover: "/projects/placeholder-2.svg",
    tags: ["Booking", "Bilingual", "Healthcare"],
    placeholder: true,
  },
  {
    slug: "addis-threads",
    title: "Launching a fashion label online",
    client: "Addis Threads",
    service: "Landing Page",
    year: 2025,
    problem: "A new clothing label had a strong look but no way to capture interest before launch.",
    solution: "A fast, striking one-page site with a waitlist and a clear brand story.",
    result: "Collected over a thousand signups before the first drop sold out.",
    cover: "/projects/placeholder-3.svg",
    tags: ["Launch", "Waitlist", "Brand"],
    placeholder: true,
  },
];
