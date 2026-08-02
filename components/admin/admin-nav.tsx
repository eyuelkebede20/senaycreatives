"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/applicants", label: "Applicants" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/work", label: "Work" },
  { href: "/admin/workspace", label: "Workspace" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/boards", label: "Boards" },
  { href: "/admin/blog", label: "Blog" },
];

import { useState } from "react";
import { LogoutButton } from "@/components/admin/logout-button";

export function AdminNav({ isAdmin = false, userName }: { isAdmin?: boolean; userName?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const links = isAdmin ? [...LINKS, { href: "/admin/users", label: "Users" }] : LINKS;
  
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex relative z-50 items-center justify-between border-b border-line bg-paper px-4 py-4">
        <Link href="/admin" className="font-display text-sm font-semibold">
          SenayCreatives <span className="text-muted">· Manager</span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-ink p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      <nav className={cn(
        "flex flex-col gap-1 border-r border-line bg-paper md:w-64 flex-shrink-0 transition-transform duration-200 ease-in-out",
        "fixed inset-y-0 left-0 z-40 w-64 p-4 pt-[80px] md:pt-4 md:relative md:translate-x-0 h-screen overflow-y-auto",
        isOpen ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full"
      )}>
        <div className="hidden md:block mb-8 mt-2 px-3">
          <Link href="/admin" className="font-display text-lg font-semibold block">
            SenayCreatives
          </Link>
          <span className="text-muted text-sm">Manager Portal</span>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {userName && (
          <div className="mt-8 border-t border-line pt-4 flex flex-col gap-3 px-3">
            <Link href="/admin/profile" className="text-sm font-medium text-ink truncate hover:underline" title="Profile & password">
              {userName}
            </Link>
            <div className="w-fit">
              <LogoutButton />
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
