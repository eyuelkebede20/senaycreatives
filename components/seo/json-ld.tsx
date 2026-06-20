import { site, SITE_URL } from "@/lib/site";
import { contact } from "@/content/contact";

// Structured data (JSON-LD). Helps search engines + rich results. Each component
// renders one <script type="application/ld+json"> with static, trusted data.

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Organization + LocalBusiness + WebSite. Rendered once in the (site) layout. */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": `${SITE_URL}/#organization`,
        name: site.name,
        url: SITE_URL,
        email: contact.email,
        telephone: contact.phone,
        description: site.description,
        logo: `${SITE_URL}/logo-mark.png`,
        image: `${SITE_URL}/logo-mark.png`,
        sameAs: contact.socials.filter((s) => (s.platform as string) !== "website").map((s) => s.href),
        areaServed: { "@type": "Country", name: contact.address.country },
        address: {
          "@type": "PostalAddress",
          addressLocality: contact.address.city,
          addressCountry: contact.address.countryCode,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: site.name,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
  return <JsonLd data={data} />;
}

/** Breadcrumb trail (e.g. Home › Projects › <project>). */
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
  return <JsonLd data={data} />;
}

/** Service offerings (used on the packages page). */
export function ServiceJsonLd({ services }: { services: { name: string; description: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": services.map((s) => ({
      "@type": "Service",
      name: s.name,
      description: s.description,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: { "@type": "Country", name: contact.address.country },
    })),
  };
  return <JsonLd data={data} />;
}

/** FAQ rich result (used on the packages page FAQ). */
export function FaqJsonLd({ items }: { items: readonly { readonly q: string; readonly a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return <JsonLd data={data} />;
}
