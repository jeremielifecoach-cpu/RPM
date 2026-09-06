"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function PlanningClient({
  blocks,
  areas,
  roles,
  weekKey,
  prevWeekKey,
  nextWeekKey,
}: any) {
  const [allBlocks, setAllBlocks] = useState<any[]>([]);

  // Charger la totalité des blocs RPM (toutes semaines confondues)
  useEffect(() => {
    async function loadAllBlocks() {
      const res = await fetch("/api/blocks?all=true");
      if (res.ok) {
        const data = await res.json();
        setAllBlocks(data);
      }
    }
    loadAllBlocks();
  }, []);

  return (
    <div className="space-y-10">
      {/* 1. HAUT DE PAGE : Vue hebdomadaire d'origine */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Étape 3 · Plan d'action massif
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-amber-50">
              Planification <span className="italic text-amber-400">RPM</span>
            </h1>
            <p className="mt-1 text-xs text-amber-200/60">
              <strong className="text-amber-300">R</strong> comme{" "}
              <strong className="text-amber-100">Résultat</strong> — une destination précise.{" "}
              <strong className="text-amber-300">P</strong> comme{" "}
              <strong className="text-amber-100">Pourquoi</strong> — ton moteur émotionnel.{" "}
              <strong className="text-amber-300">M</strong> comme{" "}
              <strong className="text-amber-100">Massif</strong> — ton plan d'action.
            </p>
          </div>

          <Link
            href="/capture"
            className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-5 py-2.5 text-sm font-bold text-amber-300 shadow-lg hover:bg-amber-500/30 transition-all"
          >
            + Nouveau bloc RPM
          </Link>
        </div>

        {/* Navigation Semaine */}
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-[#121110] p-4 shadow-xl">
          <Link
            href={`/planifier?semaine=${prevWeekKey}`}
            className="rounded-xl border border-amber-500/20 bg-black/40 px-4 py-2 text-xs font-semibold text-amber-200/80 hover:bg-amber-500/10 transition-all"
          >
            ‹ Semaine précédente
          </Link>
          <span className="text-sm font-bold text-amber-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Semaine du {weekKey}
          </span>
          <Link
            href={`/planifier?semaine=${nextWeekKey}`}
            className="rounded-xl border border-amber-500/20 bg-black/40 px-4 py-2 text-xs font-semibold text-amber-200/80 hover:bg-amber-500/10 transition-all"
          >
            Semaine suivante ›
          </Link>
        </div>

        {/* Blocs de la semaine sélectionnée */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-amber-100">
            Blocs de la semaine ({blocks?.length || 0})
          </h2>
          {(!blocks || blocks.length === 0) ? (
            <div className="rounded-2xl border border-dashed border-amber-500/20 p-8 text-center text-sm text-amber-200/40 bg-[#121110]">
              Aucun bloc RPM planifié pour cette semaine.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {blocks.map((block: any) => (
                <div
                  key={block.id}
                  className="rounded-2xl border border-amber-500/20 bg-[#121110] p-5 shadow-xl space-y-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-amber-200/50">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      {block.status || "Actif"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-amber-100">
                    {block.result || block.title || "Bloc sans titre"}
                  </h3>
                  {block.purpose && (
                    <p className="text-xs text-amber-200/60 italic">
                      "{block.purpose}"
                    </p>
                  )}
                  <div className="pt-2">
                    <Link
                      href={`/planifier/${block.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
                    >
                      Ouvrir le plan →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. BAS DE PAGE : Vue globale de tous les blocs */}
      <div className="rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
          <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Tous mes blocs RPM ({allBlocks.length})
          </h2>
          <span className="text-xs text-amber-200/50">Toutes semaines confondues</span>
        </div>

        {allBlocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-500/10 p-8 text-center text-xs text-amber-200/40">
            Aucun bloc RPM créé.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allBlocks.map((block) => (
              <div
                key={block.id}
                className="flex flex-col justify-between rounded-xl border border-amber-500/20 bg-black/40 p-4 space-y-3 hover:border-amber-500/40 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-amber-200/50">
                    <span>Semaine du {block.weekStart}</span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      {block.status || "Actif"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-amber-100 text-sm line-clamp-2">
                    {block.result || block.title || "Bloc sans titre"}
                  </h3>
                  {block.purpose && (
                    <p className="text-xs text-amber-200/60 line-clamp-2 italic">
                      "{block.purpose}"
                    </p>
                  )}
                </div>

                <Link
                  href={`/planifier/${block.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
                >
                  Ouvrir le plan →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
