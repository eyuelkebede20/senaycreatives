import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { ContactFab } from "@/components/sections/contact-fab";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { Analytics } from "@/components/seo/analytics";
import { PageView } from "@/components/seo/page-view";
import { site } from "@/lib/site";
import { getLocale, getDict } from "@/lib/i18n";

// Public marketing chrome. The manager backend (/admin) and /login render
// outside this group, so they don't get the site header/footer.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getDict();
  // Translated nav labels (fall back to the English label if a key is missing).
  const nav = site.nav.map((item) => ({ href: item.href, label: t.nav[item.href] ?? item.label }));
  const cta = { href: site.cta.href, label: t.ctaStart };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>
      <OrganizationJsonLd />
      <SiteHeader nav={nav} cta={cta} locale={locale} />
      <div id="main-content" className="flex flex-1 flex-col">
        {children}
      </div>
      <SiteFooter />
      <ContactFab />
      <Analytics />
      <PageView />
    </>
  );
}
