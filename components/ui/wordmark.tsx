import Link from "next/link";
import { cn } from "@/lib/utils";

/** Signature mark — a four-point spark. The one recurring brand glyph. */
export function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5", className)} fill="currentColor">
      <path d="M12 0c.6 6 5.4 10.8 12 12-6.6 1.2-11.4 6-12 12-.6-6-5.4-10.8-12-12C6.6 10.8 11.4 6 12 0Z" />
    </svg>
  );
}

/** SenayCreatives wordmark — spark in brand, text in ink. Links home by default. */
export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight", className)}>
      <Spark className="size-4 text-brand" />
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
