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
    responsibilities: ["Build responsive, accessible UI from designs", "Care about performance and Lighthouse scores", "Collaborate closely with design and backend"],
    requirements: ["Solid React/TypeScript experience", "An eye for detail and motion", "Portfolio of shipped work"],
    open: true,
    placeholder: true,
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    type: "Full-time",
    location: "Addis Ababa / Remote",
    summary: "Shape the look and flow of client products from discovery through launch.",
    responsibilities: ["Turn problems into clear, beautiful interfaces", "Build and maintain design systems", "Prototype interactions and motion"],
    requirements: ["Strong portfolio across web and brand", "Fluency in Figma", "Understanding of responsive, accessible design"],
    open: true,
    placeholder: true,
  },
  {
    slug: "digital-marketer",
    title: "Digital Marketer",
    type: "Contract",
    location: "Remote",
    summary: "Run full-funnel campaigns and content for SenayCreatives clients.",
    responsibilities: ["Plan and run paid + organic campaigns", "Produce and schedule content", "Report on results and iterate"],
    requirements: ["Proven campaign results", "Comfort with analytics tools", "Amharic + English a strong plus"],
    open: true,
    placeholder: true,
  },
  {
    slug: "video-editor",
    title: "Video Editor",
    type: "Contract",
    location: "Remote",
    summary: "Edit engaging short-form and long-form video content for SenayCreatives clients.",
    responsibilities: [
      "Edit videos for social media, campaigns, and digital platforms",
      "Add captions, transitions, music, sound effects, and motion graphics",
      "Turn raw footage into polished, engaging stories",
      "Collaborate with the creative team to meet project requirements",
    ],
    requirements: [
      "Proficiency in Premiere Pro, DaVinci Resolve, CapCut, or similar tools",
      "Strong understanding of pacing, storytelling, and visual composition",
      "Good attention to detail and ability to meet deadlines",
      "Experience creating content for TikTok, Instagram, YouTube, or similar platforms",
      "Amharic + English a strong plus",
    ],
    open: true,
    placeholder: true,
  },
  {
    slug: "graphic-designer",
    title: "Graphic Designer",
    type: "Contract",
    location: "Remote",
    summary: "Create compelling visual content and brand assets for SenayCreatives clients.",
    responsibilities: [
      "Design social media posts, banners, advertisements, and marketing materials",
      "Develop visual concepts that align with client brands and campaigns",
      "Create and maintain consistent brand identities across platforms",
      "Collaborate with the creative team to turn ideas into polished designs",
    ],
    requirements: [
      "Proficiency in Adobe Illustrator, Photoshop, Figma, or similar tools",
      "Strong understanding of typography, color, layout, and visual hierarchy",
      "A strong portfolio demonstrating creative and practical design work",
      "Ability to work with feedback and meet deadlines",
      "Amharic + English a strong plus",
    ],
    open: true,
    placeholder: true,
  },
];
