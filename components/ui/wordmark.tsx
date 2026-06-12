import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Signature mark — a four-point spark, used as a quiet decorative glyph. */
export function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5", className)} fill="currentColor">
      <path d="M12 0c.6 6 5.4 10.8 12 12-6.6 1.2-11.4 6-12 12-.6-6-5.4-10.8-12-12C6.6 10.8 11.4 6 12 0Z" />
    </svg>
  );
}

/** The SenayCreatives logo inside a circular border — the brand badge. */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-paper",
        className,
      )}
    >
      <Image
        src="/logo-mark.png"
        alt="SenayCreatives logo"
        width={72}
        height={72}
        className="size-[74%] object-contain"
        priority
      />
    </span>
  );
}

/** SenayCreatives wordmark — circular logo badge + text. Links home by default. */
export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight", className)}>
      <LogoBadge />
      <span>
        Senay<span className="text-ink-soft">Creatives</span>
      </span>
    </span>
  );
  if (href === null) return content;
  return (
    <Link href={href} aria-label="SenayCreatives — home" className="inline-flex">
      {content}
    </Link>
  );
}
