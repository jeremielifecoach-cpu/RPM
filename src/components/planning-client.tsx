"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function PlanningClient(props: any) {
  const [allBlocks, setAllBlocks] = useState<any[]>([]);

  // Charger la totalité des blocs RPM créés
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
      {/* 1. Vue Hebdomadaire Principale Existant */}
      {/* (Garde la logique hebdomadaire actuelle si tu as ton propre composant interne ou rends tes blocs de la semaine ici) */}

      {/* 2. Section Globale : Tous les Blocs RPM */}
      <div className="rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
          <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Tous mes blocs RPM ({allBlocks.length})
          </h2>
          <span className="text-xs text-amber-200/50">Vue d'ensemble globale</span>
        </div>

        {allBlocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-500/10 p-8 text-center text-xs text-amber-200/40">
            Aucun bloc RPM créé pour le moment.
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
