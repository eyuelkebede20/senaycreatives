// content/roles.ts — open positions for the Careers (Hiring Now) page.
// PLACEHOLDER content. `slug` is what the application form submits as roleSlug.

export type Role = {
  slug: string;
  title: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  location: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  open: boolean;
  placeholder?: boolean;
};

export const roles: Role[] = [
  {
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    type: "Full-time",
    location: "Addis Ababa / Remote",
    summary: "Build fast, accessible interfaces for client projects in Next.js and TypeScript.",
    responsibilities: [
      "Build responsive, accessible UI from designs",
      "Care about performance and Lighthouse scores",
      "Collaborate closely with design and backend",
    ],
    requirements: [
      "Solid React/TypeScript experience",
      "An eye for detail and motion",
      "Portfolio of shipped work",
    ],
    open: true,
    placeholder: true,
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    type: "Full-time",
    location: "Addis Ababa / Remote",
    summary: "Shape the look and flow of client products from discovery through launch.",
    responsibilities: [
      "Turn problems into clear, beautiful interfaces",
      "Build and maintain design systems",
      "Prototype interactions and motion",
    ],
    requirements: [
      "Strong portfolio across web and brand",
      "Fluency in Figma",
      "Understanding of responsive, accessible design",
    ],
    open: true,
    placeholder: true,
  },
  {
    slug: "digital-marketer",
    title: "Digital Marketer",
    type: "Contract",
    location: "Remote",
    summary: "Run full-funnel campaigns and content for SenayCreatives clients.",
    responsibilities: [
      "Plan and run paid + organic campaigns",
      "Produce and schedule content",
      "Report on results and iterate",
    ],
    requirements: [
      "Proven campaign results",
      "Comfort with analytics tools",
      "Amharic + English a strong plus",
    ],
    open: true,
    placeholder: true,
  },
];
