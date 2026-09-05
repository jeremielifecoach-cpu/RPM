import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPM — The Time of Your Life | Planification Rapide",
  description:
    "Application de planification RPM inspirée de Tony Robbins : Résultat, Pourquoi, Plan d'action massif. Organise ta vie, semaine après semaine.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#070708] text-zinc-200 antialiased">
        <div className="grain" aria-hidden />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
