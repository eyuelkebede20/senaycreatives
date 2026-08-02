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
    slug: "sales-representative",
    title: "Sales Representative",
    type: "Contract",
    location: "Remote",
    summary: "Build client relationships and drive sales for SenayCreatives services.",
    responsibilities: [
      "Identify and reach out to potential clients",
      "Present SenayCreatives services and tailor solutions to client needs",
      "Manage leads, follow-ups, and client communications",
      "Negotiate deals and help convert prospects into long-term clients",
      "Track sales activities and report on results",
    ],
    requirements: [
      "Strong communication and interpersonal skills",
      "Previous sales or business development experience is a plus",
      "Confident in pitching services and negotiating with clients",
      "Self-motivated and comfortable working independently",
      "Amharic + English required",
    ],
    open: true,
    placeholder: true,
  },
  {
    slug: "social-media-manager",
    title: "Social Media Manager",
    type: "Contract",
    location: "Remote",
    summary: "Manage social media presence, content, and audience growth for SenayCreatives clients.",
    responsibilities: [
      "Develop and manage social media content calendars",
      "Create, curate, and schedule engaging content across platforms",
      "Monitor audience engagement, comments, and messages",
      "Track social media performance and provide regular reports",
      "Collaborate with designers, video editors, and marketers on campaigns",
    ],
    requirements: [
      "Experience managing social media accounts professionally",
      "Strong understanding of Instagram, TikTok, Facebook, and other major platforms",
      "Good copywriting and communication skills",
      "Comfort with social media analytics and scheduling tools",
      "Creative, organized, and able to meet deadlines",
      "Amharic + English a strong plus",
    ],
    open: true,
    placeholder: true,
  },
  {
    slug: "social-media-content-creator",
    title: "Social Media Content Creator",
    type: "Contract",
    location: "Remote",
    summary: "Create engaging, platform-ready content that helps SenayCreatives clients grow their online presence.",
    responsibilities: [
      "Develop creative content ideas for social media campaigns",
      "Create short-form videos, reels, photos, graphics, and written content",
      "Research trends, sounds, formats, and topics relevant to each platform",
      "Write engaging captions, hooks, and calls to action",
      "Collaborate with designers, video editors, and social media managers",
    ],
    requirements: [
      "Strong understanding of social media trends and content formats",
      "Creative storytelling and strong communication skills",
      "Ability to create engaging content using tools such as Canva, CapCut, Adobe, or similar",
      "Comfort appearing on camera or directing on-camera content is a plus",
      "A portfolio or examples of previous social media content",
      "Amharic + English a strong plus",
    ],
    open: true,
    placeholder: true,
  },
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
    slug: "videographer",
    title: "Videographer",
    type: "Contract",
    location: "Remote",
    summary: "Capture high-quality visual content for SenayCreatives clients, campaigns, and social media.",
    responsibilities: [
      "Plan and shoot professional video content for clients and campaigns",
      "Set up cameras, lighting, audio, and other production equipment",
      "Capture interviews, events, product shots, and social media content",
      "Work with the creative team to translate concepts into compelling visuals",
      "Organize and manage raw footage for post-production",
    ],
    requirements: [
      "Experience with professional cameras, lighting, and audio equipment",
      "Strong understanding of framing, composition, lighting, and visual storytelling",
      "Ability to shoot both vertical and horizontal content for different platforms",
      "A portfolio or examples of previous videography work",
      "Reliable, creative, and able to work within production deadlines",
      "Amharic + English a strong plus",
    ],
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
