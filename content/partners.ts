// content/partners.ts — real partners/clients + testimonials.

export type Partner = {
  name: string;
  url?: string;
  /** Optional logo under /public/partners/… — we render the name as text until logos arrive. */
  logo?: string;
  placeholder?: boolean;
};

export type Testimonial = {
  quote: string;
  author: string;
  title: string;
  placeholder?: boolean;
};

export const partners: Partner[] = [
  { name: "ACHC", url: "https://achc.et" },
  { name: "Dialogue Ethiopia", url: "https://dialogueethiopia.org" },
  { name: "EthioNet Agency", url: "https://ethionetagency.com" },
];

// No real testimonials yet — clearly placeholder, not attributed to real clients.
export const testimonials: Testimonial[] = [
  {
    quote: "They understood the problem before touching a design, and delivered exactly what we needed.",
    author: "[Client Name]",
    title: "[Role, Company]",
    placeholder: true,
  },
];
