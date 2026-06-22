import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";
import { site } from "@/lib/site";
import { contact } from "@/content/contact";
import { services, type ServiceKey } from "@/content/pricing";
import { getDict } from "@/lib/i18n";

const serviceKeys = Object.keys(services) as ServiceKey[];

export async function SiteFooter() {
  const t = await getDict();
  return (
    <footer className="mt-24 border-t border-line bg-paper-dim">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-ink-soft">{t.footer.tagline}</p>
          <p className="mt-4 text-sm text-muted">{site.location}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">{t.footer.explore}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-soft hover:text-ink">
                  {t.nav[item.href] ?? item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">{t.footer.services}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {serviceKeys.map((key) => (
              <li key={key}>
                <Link href="/packages" className="text-ink-soft hover:text-ink">
                  {services[key].name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">{t.footer.getInTouch}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="text-ink-soft hover:text-ink">
                {site.email}
              </a>
            </li>
            {contact.phone && (
              <li>
                <a href={contact.phoneHref} className="text-ink-soft hover:text-ink">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.whatsapp && (
              <li>
                <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-ink">
                  WhatsApp
                </a>
              </li>
            )}
            {contact.telegram && (
              <li>
                <a href={`https://t.me/${contact.telegram}`} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-ink">
                  Telegram
                </a>
              </li>
            )}
            {contact.bookingUrl && (
              <li>
                <a href={contact.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-ink">
                  Book a call
                </a>
              </li>
            )}
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <p>
            © {YEAR} {site.name}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-ink">
              {t.footer.privacy}
            </Link>
            <p>{t.footer.built}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

// Static build year — fine for a footer; avoids a client component just for a date.
const YEAR = 2026;
