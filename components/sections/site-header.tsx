"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";
import { LanguageToggle } from "@/components/ui/language-toggle";
import type { Locale } from "@/content/i18n";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

export function SiteHeader({ nav, cta, locale }: { nav: NavItem[]; cta: NavItem; locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Subtle hairline + shadow once the page scrolls away from the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-paper/85 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_1px_0_0_var(--color-line)]",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Wordmark />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-colors hover:text-ink",
                  active ? "text-ink" : "text-ink-soft",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle current={locale} />
          <Button href={cta.href}>{cta.label}</Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="-mr-2 inline-flex size-10 items-center justify-center rounded-full text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base text-ink-soft hover:bg-paper-dim hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="px-3 py-3">
              <LanguageToggle current={locale} />
            </div>
            <Button href={cta.href} onClick={() => setOpen(false)} className="mt-2 w-full">
              {cta.label}
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
