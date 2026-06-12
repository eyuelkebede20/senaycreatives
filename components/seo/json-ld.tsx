import { site, SITE_URL } from "@/lib/site";

// Organization + WebSite structured data. Helps search engines and rich results
// understand who we are. Rendered once in the root layout.
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: site.name,
        url: SITE_URL,
        email: site.email,
        description: site.description,
        logo: `${SITE_URL}/logo-mark.png`,
        sameAs: site.socials.map((s) => s.href),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Addis Ababa",
          addressCountry: "ET",
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

  return (
    <script
      type="application/ld+json"
      // Static, trusted data — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
