"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Inbox", exact: true },
  { href: "/admin/applicants", label: "Applicants" },
  { href: "/admin/boards", label: "Boards" },
];

export function AdminNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...LINKS, { href: "/admin/users", label: "Users" }] : LINKS;
  return (
    <nav className="flex items-center gap-1">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
