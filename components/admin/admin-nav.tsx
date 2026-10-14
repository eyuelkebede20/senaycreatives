"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/admin/logout-button";

// ─────────────────────────────────────────────────────────────────────────────
// Custom micro-SVG icons designed for the Senay Creatives design language
// ─────────────────────────────────────────────────────────────────────────────

function DashboardIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function ContractsIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h4m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ApplicantsIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ClientsIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function WorkIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function WorkspaceIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function TeamsIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function BoardsIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  );
}

function BlogIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function UsersIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ProfileIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation items configuration
// ─────────────────────────────────────────────────────────────────────────────

interface NavItemDef {
  href: string;
  label: string;
  shortLabel: string;
  desc: string;
  category: "core" | "workspace" | "publishing" | "admin";
  exact?: boolean;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const ALL_NAV_ITEMS: NavItemDef[] = [
  {
    href: "/admin",
    label: "Dashboard",
    shortLabel: "Dashboard",
    desc: "Overview & project inquiries",
    category: "core",
    exact: true,
    icon: DashboardIcon,
  },
  {
    href: "/admin/contracts",
    label: "Contracts & Mail",
    shortLabel: "Contracts",
    desc: "A4 documents, proposals & emails",
    category: "core",
    icon: ContractsIcon,
  },
  {
    href: "/admin/clients",
    label: "Clients",
    shortLabel: "Clients",
    desc: "Active clients & contact directory",
    category: "core",
    icon: ClientsIcon,
  },
  {
    href: "/admin/applicants",
    label: "Applicants",
    shortLabel: "Applicants",
    desc: "Job candidates & review pipeline",
    category: "core",
    icon: ApplicantsIcon,
  },
  {
    href: "/admin/work",
    label: "Work",
    shortLabel: "Work",
    desc: "Case studies & portfolio projects",
    category: "workspace",
    icon: WorkIcon,
  },
  {
    href: "/admin/workspace",
    label: "Workspace",
    shortLabel: "Workspace",
    desc: "Floor map & space management",
    category: "workspace",
    icon: WorkspaceIcon,
  },
  {
    href: "/admin/teams",
    label: "Teams",
    shortLabel: "Teams",
    desc: "Team structure & assigned tasks",
    category: "workspace",
    icon: TeamsIcon,
  },
  {
    href: "/admin/boards",
    label: "Boards",
    shortLabel: "Boards",
    desc: "Kanban boards & project flows",
    category: "workspace",
    icon: BoardsIcon,
  },
  {
    href: "/admin/blog",
    label: "Blog",
    shortLabel: "Blog",
    desc: "Articles, editorial & updates",
    category: "publishing",
    icon: BlogIcon,
  },
  {
    href: "/admin/users",
    label: "Users & Roles",
    shortLabel: "Users",
    desc: "Staff access & role management",
    category: "admin",
    icon: UsersIcon,
  },
];

// The 4 primary quick-access tabs shown directly on mobile bottom bar
const PRIMARY_BOTTOM_HREFS = ["/admin", "/admin/contracts", "/admin/clients", "/admin/applicants"];

export function AdminNav({ isAdmin = false, userName }: { isAdmin?: boolean; userName?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Filter links by role
  const navItems = ALL_NAV_ITEMS.filter((item) => (item.category === "admin" ? isAdmin : true));

  // Auto-close sheet when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isItemActive = (item: { href: string; exact?: boolean }) => {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  };

  // Find currently active item for mobile top bar display
  const activeItem = navItems.find((i) => isItemActive(i)) || {
    label: pathname === "/admin/profile" ? "Profile" : "Manager",
  };

  // Check if active page is outside the 4 bottom tabs (meaning "More" tab is active)
  const isOverflowActive =
    !PRIMARY_BOTTOM_HREFS.some((href) => (href === "/admin" ? pathname === href : pathname.startsWith(href)));

  const primaryBottomTabs = navItems.filter((i) => PRIMARY_BOTTOM_HREFS.includes(i.href));

  // Groups for sheet
  const coreItems = navItems.filter((i) => i.category === "core");
  const workspaceItems = navItems.filter((i) => i.category === "workspace");
  const otherItems = navItems.filter((i) => i.category === "publishing" || i.category === "admin");

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE TOP BAR (Sticky with interactive route switcher dropdown)    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 backdrop-blur-md px-3.5 sm:px-4 py-2.5 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin"
            className="font-display text-sm font-bold tracking-tight text-ink flex-shrink-0 hover:opacity-85 transition-opacity"
          >
            SenayCreatives
          </Link>
          <span className="text-muted/60 text-xs font-light">/</span>

          {/* Interactive Route Dropdown Pill */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-dim/80 hover:bg-paper-dim px-2.5 py-1 text-xs font-medium text-ink transition-all active:scale-95 truncate max-w-[155px] sm:max-w-[210px] shadow-2xs"
            title="Open quick navigation menu"
            aria-expanded={isOpen}
          >
            <span className="truncate">{activeItem.label}</span>
            <svg
              className={cn("size-3 text-muted transition-transform duration-200 flex-shrink-0", isOpen && "rotate-180")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* User Profile Avatar Link */}
          {userName && (
            <Link
              href="/admin/profile"
              className={cn(
                "size-8 rounded-full flex items-center justify-center font-display text-xs font-semibold border transition-all shadow-2xs",
                pathname === "/admin/profile"
                  ? "border-brand bg-brand text-paper"
                  : "border-line bg-paper-dim text-ink hover:border-ink hover:bg-paper",
              )}
              title={`Signed in as ${userName} · Profile`}
            >
              {userName.slice(0, 1).toUpperCase()}
            </Link>
          )}

          {/* Menu Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="size-8.5 rounded-xl border border-line bg-paper hover:bg-paper-dim flex items-center justify-center text-ink transition-colors shadow-2xs active:scale-95"
          >
            {isOpen ? (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly primary destinations)  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-lg border-t border-line shadow-[0_-4px_24px_rgba(21,20,15,0.06)] px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {primaryBottomTabs.map((tab) => {
            const active = isItemActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 relative group",
                  active ? "text-brand" : "text-muted hover:text-ink active:scale-95",
                )}
              >
                {active && (
                  <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-brand" />
                )}
                <div
                  className={cn(
                    "size-7 rounded-lg flex items-center justify-center transition-colors",
                    active ? "bg-brand/10 text-brand" : "text-muted group-hover:text-ink",
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-full",
                    active ? "font-semibold text-brand" : "font-normal text-muted group-hover:text-ink",
                  )}
                >
                  {tab.shortLabel}
                </span>
              </Link>
            );
          })}

          {/* "More" Sheet Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 relative group",
              isOpen || isOverflowActive ? "text-brand" : "text-muted hover:text-ink active:scale-95",
            )}
            title="Browse all sections"
            aria-label="Browse all sections"
          >
            {(isOpen || isOverflowActive) && (
              <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-brand" />
            )}
            <div
              className={cn(
                "size-7 rounded-lg flex items-center justify-center relative transition-colors",
                isOpen || isOverflowActive ? "bg-brand/10 text-brand" : "text-muted group-hover:text-ink",
              )}
            >
              <svg className="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {isOverflowActive && !isOpen && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-brand ring-2 ring-paper" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-full",
                isOpen || isOverflowActive ? "font-semibold text-brand" : "font-normal text-muted group-hover:text-ink",
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE NAVIGATION SHEET (Thumb-friendly slide-up sheet)             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet Surface */}
          <div className="relative z-10 w-full max-h-[85vh] rounded-t-[28px] border-t border-line bg-paper shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drag Handle Bar */}
            <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={() => setIsOpen(false)}>
              <span className="w-12 h-1.5 rounded-full bg-line" />
            </div>

            {/* Sheet Header */}
            <div className="px-5 py-3 border-b border-line flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Manager Navigation</h3>
                <p className="text-xs text-muted">Tap any destination to navigate</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full bg-paper-dim hover:bg-line/60 text-muted hover:text-ink flex items-center justify-center transition-colors"
                aria-label="Close navigation"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Navigation Groups */}
            <div className="overflow-y-auto px-4 py-4 space-y-5 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
              {/* Group 1: Core Operations */}
              <div>
                <p className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
                  Core Management
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {coreItems.map((item) => {
                    const active = isItemActive(item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl transition-all border",
                          active
                            ? "bg-ink text-paper border-ink shadow-sm"
                            : "bg-paper-dim/40 border-line/60 text-ink hover:bg-paper-dim hover:border-line",
                        )}
                      >
                        <div
                          className={cn(
                            "size-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            active ? "bg-white/15 text-paper" : "bg-paper text-ink-soft border border-line/60",
                          )}
                        >
                          <Icon className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate leading-tight">{item.label}</p>
                          <p
                            className={cn(
                              "text-xs truncate leading-tight mt-0.5",
                              active ? "text-paper/80" : "text-muted",
                            )}
                          >
                            {item.desc}
                          </p>
                        </div>
                        {active && (
                          <span className="size-2 rounded-full bg-brand flex-shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Workspace & Collaboration */}
              <div>
                <p className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
                  Workspace & Planning
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {workspaceItems.map((item) => {
                    const active = isItemActive(item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl transition-all border",
                          active
                            ? "bg-ink text-paper border-ink shadow-sm"
                            : "bg-paper-dim/40 border-line/60 text-ink hover:bg-paper-dim hover:border-line",
                        )}
                      >
                        <div
                          className={cn(
                            "size-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            active ? "bg-white/15 text-paper" : "bg-paper text-ink-soft border border-line/60",
                          )}
                        >
                          <Icon className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate leading-tight">{item.label}</p>
                          <p
                            className={cn(
                              "text-xs truncate leading-tight mt-0.5",
                              active ? "text-paper/80" : "text-muted",
                            )}
                          >
                            {item.desc}
                          </p>
                        </div>
                        {active && (
                          <span className="size-2 rounded-full bg-brand flex-shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: Content & System */}
              {otherItems.length > 0 && (
                <div>
                  <p className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
                    Publishing & Access
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {otherItems.map((item) => {
                      const active = isItemActive(item);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-xl transition-all border",
                            active
                              ? "bg-ink text-paper border-ink shadow-sm"
                              : "bg-paper-dim/40 border-line/60 text-ink hover:bg-paper-dim hover:border-line",
                          )}
                        >
                          <div
                            className={cn(
                              "size-8 rounded-lg flex items-center justify-center flex-shrink-0",
                              active ? "bg-white/15 text-paper" : "bg-paper text-ink-soft border border-line/60",
                            )}
                          >
                            <Icon className="size-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate leading-tight">{item.label}</p>
                            <p
                              className={cn(
                                "text-xs truncate leading-tight mt-0.5",
                                active ? "text-paper/80" : "text-muted",
                              )}
                            >
                              {item.desc}
                            </p>
                          </div>
                          {active && (
                            <span className="size-2 rounded-full bg-brand flex-shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Account & Profile Card */}
              {userName && (
                <div className="pt-2 border-t border-line">
                  <div className="p-3 rounded-2xl bg-paper-dim border border-line flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-9 rounded-full bg-brand text-paper flex items-center justify-center font-display font-semibold text-sm flex-shrink-0">
                          {userName.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate leading-tight">{userName}</p>
                          <p className="text-xs text-muted truncate leading-tight capitalize">
                            {isAdmin ? "Admin Manager" : "Manager"}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/admin/profile"
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-1.5 rounded-lg border border-line bg-paper text-xs font-medium text-ink hover:bg-paper-dim transition-colors flex-shrink-0"
                      >
                        Profile Settings
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                      <span className="text-xs text-muted">End current session:</span>
                      <LogoutButton />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DESKTOP SIDEBAR (Visible on md and up)                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <nav className="hidden md:flex flex-col border-r border-line bg-paper w-64 flex-shrink-0 h-screen overflow-y-auto p-4 justify-between">
        <div className="flex flex-col gap-6">
          {/* Brand header */}
          <div className="px-3 pt-2">
            <Link href="/admin" className="font-display text-lg font-semibold block text-ink hover:opacity-90 transition-opacity">
              SenayCreatives
            </Link>
            <span className="text-muted text-xs tracking-wide uppercase font-medium">Manager Portal</span>
          </div>

          {/* Links list */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all group",
                    active
                      ? "bg-ink text-paper shadow-sm"
                      : "text-ink-soft hover:bg-paper-dim hover:text-ink",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5 flex-shrink-0 transition-colors",
                      active ? "text-paper" : "text-muted group-hover:text-ink",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span className="ml-auto size-1.5 rounded-full bg-brand flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User profile & logout on desktop */}
        {userName && (
          <div className="border-t border-line pt-4 px-2 flex flex-col gap-3">
            <Link
              href="/admin/profile"
              className={cn(
                "flex items-center gap-2.5 p-2 rounded-xl transition-colors hover:bg-paper-dim",
                pathname === "/admin/profile" && "bg-paper-dim",
              )}
              title="Profile & sender settings"
            >
              <div className="size-8 rounded-full bg-ink text-paper flex items-center justify-center font-display text-xs font-semibold flex-shrink-0">
                {userName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate leading-tight">{userName}</p>
                <p className="text-xs text-muted leading-tight">View Profile</p>
              </div>
            </Link>
            <div className="px-2">
              <LogoutButton />
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
