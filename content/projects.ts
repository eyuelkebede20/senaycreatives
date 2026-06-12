// content/projects.ts — portfolio case studies (problem → solution → result).
// Real client and capability work. Results are kept qualitative where we don't
// publish client metrics; refine copy with the client's blessing.

export type Project = {
  slug: string;
  title: string;
  client: string;
  service: string;
  year: number;
  problem: string;
  solution: string;
  result: string;
  url?: string;
  /** Optional cover under /public/projects/… — a styled placeholder shows until it exists. */
  cover?: string;
  tags: string[];
  placeholder?: boolean;
};

export const projects: Project[] = [
  {
    slug: "achc",
    title: "A clear, fast web presence for ACHC",
    client: "ACHC",
    service: "Business Website",
    year: 2024,
    problem: "ACHC needed a credible, easy-to-update online presence that reflected the seriousness of their work.",
    solution: "We designed and built a fast, accessible website with a structure their team can maintain.",
    result: "A professional site that loads quickly and represents the organisation with confidence.",
    url: "https://achc.et",
    tags: ["Website", "Design", "Accessibility"],
  },
  {
    slug: "dialogue-ethiopia",
    title: "A content platform for Dialogue Ethiopia",
    client: "Dialogue Ethiopia",
    service: "Business Website",
    year: 2024,
    problem: "Dialogue Ethiopia needed to publish and organise their work for a wide audience.",
    solution: "We built a clean, content-first website that makes their material easy to find and read.",
    result: "A clear home for their ideas that's straightforward for the team to keep current.",
    url: "https://dialogueethiopia.org",
    tags: ["Website", "Content", "Bilingual"],
  },
  {
    slug: "ethionet-agency",
    title: "A sharp landing experience for EthioNet Agency",
    client: "EthioNet Agency",
    service: "Landing Page",
    year: 2025,
    problem: "EthioNet Agency wanted a striking, conversion-focused presence online.",
    solution: "We delivered a fast landing site with clear messaging and a strong first impression.",
    result: "A polished site that communicates the agency's offering at a glance.",
    url: "https://ethionetagency.com",
    tags: ["Landing Page", "Conversion", "Brand"],
  },
  {
    slug: "database-management-system",
    title: "A custom database management system",
    client: "Private client",
    service: "App Development",
    year: 2025,
    problem: "A growing operation was drowning in spreadsheets with no single source of truth.",
    solution: "We built a tailored database management system to capture, organise, and report on their data.",
    result: "One reliable system replacing scattered files, with the reports the team actually needs.",
    tags: ["Database", "Internal tool", "Custom software"],
  },
  {
    slug: "ai-automation",
    title: "Custom automation with AI integration",
    client: "Private client",
    service: "App Development",
    year: 2025,
    problem: "Repetitive manual work was eating hours and introducing errors.",
    solution: "We designed custom automation with AI integration to handle the repetitive steps end to end.",
    result: "Hours of manual work removed each week, with fewer mistakes along the way.",
    tags: ["Automation", "AI integration", "Custom software"],
  },
];
