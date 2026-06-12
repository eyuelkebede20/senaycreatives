// content/partners.ts — partner/client logos + testimonials. PLACEHOLDER content.

export type Partner = {
  name: string;
  /** Stored under /public/partners/… — placeholders may not exist yet. */
  logo: string;
  url?: string;
  placeholder?: boolean;
};

export type Testimonial = {
  quote: string;
  author: string;
  title: string;
  placeholder?: boolean;
};

export const partners: Partner[] = [
  { name: "Merkato Grocers", logo: "/partners/placeholder-1.svg", placeholder: true },
  { name: "Habesha Clinic", logo: "/partners/placeholder-2.svg", placeholder: true },
  { name: "Addis Threads", logo: "/partners/placeholder-3.svg", placeholder: true },
  { name: "Blue Nile Logistics", logo: "/partners/placeholder-4.svg", placeholder: true },
  { name: "Sheba Foods", logo: "/partners/placeholder-5.svg", placeholder: true },
  { name: "Lalibela Tours", logo: "/partners/placeholder-6.svg", placeholder: true },
];

export const testimonials: Testimonial[] = [
  {
    quote: "They understood the problem before touching a design. The result paid for itself in months.",
    author: "[Client Name]",
    title: "Owner, Merkato Grocers",
    placeholder: true,
  },
  {
    quote: "Our site finally looks like the business we actually are. Bookings went up immediately.",
    author: "[Client Name]",
    title: "Director, Habesha Clinic",
    placeholder: true,
  },
];
