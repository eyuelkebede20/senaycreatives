import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";
import { site } from "@/lib/site";
import { services, type ServiceKey } from "@/content/pricing";

const serviceKeys = Object.keys(services) as ServiceKey[];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-dim">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-ink-soft">{site.tagline}</p>
          <p className="mt-4 text-sm text-muted">{site.location}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-soft hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Services</h2>
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
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Get in touch</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="text-ink-soft hover:text-ink">
                {site.email}
              </a>
            </li>
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
            © {YEAR} {site.name}. All rights reserved.
          </p>
          <p>Built by SenayCreatives.</p>
        </Container>
      </div>
    </footer>
  );
}

// Static build year — fine for a footer; avoids a client component just for a date.
const YEAR = 2026;
