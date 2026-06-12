import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 h-11 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-brand",
  outline: "border border-line text-ink hover:border-ink",
  ghost: "text-ink hover:bg-paper-dim",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

/** Button that renders as a real <a> when `href` is set, else a <button>. */
export function Button({
  variant = "solid",
  className,
  children,
  href,
  ...props
}: CommonProps &
  (
    | ({ href: string } & React.ComponentProps<typeof Link>)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classes = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link {...(props as Omit<React.ComponentProps<typeof Link>, "href" | "className">)} href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} className={classes}>
      {children}
    </button>
  );
}
