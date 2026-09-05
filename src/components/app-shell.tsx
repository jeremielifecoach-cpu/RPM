"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Inbox,
  Target,
  CircleDashed,
  Fingerprint,
  PenLine,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/capture", label: "Capture", icon: Inbox },
  { href: "/planifier", label: "Planification RPM", icon: Target },
  { href: "/domaines", label: "Domaines de vie", icon: CircleDashed },
  { href: "/roles", label: "Rôles & Valeurs", icon: Fingerprint },
  { href: "/journal", label: "Journal", icon: PenLine },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_28px_rgba(245,185,60,0.35)] transition-transform duration-300 group-hover:rotate-6">
        <Zap className="h-5 w-5 text-black" strokeWidth={2.6} />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold tracking-wide text-zinc-100">
          RPM
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/90">
          Time of your life
        </span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1.5">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full transition-all duration-300",
                active ? "bg-amber-400 opacity-100" : "opacity-0"
              )}
            />
            <item.icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"
              )}
              strokeWidth={2}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Lueur ambiante */}
      <div className="pointer-events-none fixed inset-0 gold-glow" aria-hidden />
      <div
        className="pointer-events-none fixed -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-amber-500/[0.04] blur-[120px]"
        aria-hidden
      />

      {/* Barre latérale — bureau */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0b0b0d]/90 px-5 py-7 backdrop-blur-xl lg:flex">
        <div className="px-1.5">
          <Logo />
        </div>
        <div className="mt-10 flex-1">
          <NavList />
        </div>
        <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-4">
          <p className="font-display text-sm italic leading-snug text-amber-200/90">
            « Ce n’est pas en gérant ton temps que tu changes ta vie, c’est en
            gérant ta vie. »
          </p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Tony Robbins
          </p>
        </div>
      </aside>

      {/* Barre mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-[#0b0b0d]/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-zinc-300"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 pt-16 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <div className="border-b border-white/[0.06] bg-[#0b0b0d] p-4" onClick={(e) => e.stopPropagation()}>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Contenu */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-8 lg:pl-72 lg:pr-10 lg:pt-10 xl:max-w-6xl">
        <div className="lg:hidden">{/* espacement mobile */}</div>
        <div className="mx-auto w-full max-w-4xl lg:mx-0 lg:max-w-none xl:pl-4">
          {children}
        </div>
      </main>
    </div>
  );
}
