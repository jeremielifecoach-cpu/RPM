"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Vision CEO", href: "/vision", icon: "🎯" },
    { name: "Tableau de Bord", href: "/", icon: "⚡" },
    { name: "Capturer (Inbox)", href: "/capture", icon: "📥" },
    { name: "Planifier (RPM)", href: "/planifier", icon: "🗓️" },
    { name: "Domaines de vie", href: "/domaines", icon: "💎" },
    { name: "Rôles & Identités", href: "/roles", icon: "👑" },
    { name: "Journal & Bilan", href: "/journal", icon: "📖" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0c0b0a] text-amber-50 selection:bg-amber-500 selection:text-black">
      {/* Sidebar de navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-amber-500/10 bg-[#121110] p-6 shadow-2xl flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-extrabold shadow-lg shadow-amber-500/20">
              RPM
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-amber-100">
                Life Master
              </h2>
              <p className="text-[10px] text-amber-200/50 uppercase tracking-widest font-bold">
                Rapid Planning Method
              </p>
            </div>
          </div>

          {/* Menu principal */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/5"
                      : "text-amber-200/60 hover:bg-amber-500/10 hover:text-amber-200"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="border-t border-amber-500/10 pt-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-200/40">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Système RPM Opérationnel</span>
          </div>
        </div>
      </aside>

      {/* Navigation Mobile en Haut */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#121110] border-b border-amber-500/10 p-4 flex items-center justify-between">
        <span className="font-extrabold text-amber-400 text-sm">RPM Life Master</span>
        <div className="flex gap-2 text-xs overflow-x-auto">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap ${
                pathname === item.href ? "bg-amber-500/20 text-amber-300" : "text-amber-200/60"
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Zone de contenu principal */}
      <main className="flex-1 md:pl-64 p-6 md:p-10 mt-12 md:mt-0 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
