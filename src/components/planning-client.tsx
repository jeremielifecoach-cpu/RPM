"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Area, Role, RpmBlock, ActionItem } from "@/db/schema";

interface ExtendedBlock extends RpmBlock {
  area?: Area | null;
  role?: Role | null;
  actions?: ActionItem[];
}

interface PlanningClientProps {
  blocks: ExtendedBlock[];
  areas: Area[];
  roles: Role[];
  weekKey: string;
  prevWeekKey: string;
  nextWeekKey: string;
}

function formatDateFr(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PlanningClient({
  blocks: initialBlocks,
  areas,
  roles,
  weekKey,
  prevWeekKey,
  nextWeekKey,
}: PlanningClientProps) {
  const [allBlocks, setAllBlocks] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

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

  const handleAction = async (blockId: string, isReport: boolean) => {
    setLoadingId(blockId);
    const res = await fetch(`/api/blocks/${blockId}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isReport }),
    });
    if (res.ok) {
      const newBlock = await res.json();
      router.push(`/planifier?semaine=${newBlock.weekStart}`);
      router.refresh();
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Étape 3 · Plan d'action massif
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-amber-50">
              Planification <span className="italic text-amber-400">RPM</span>
            </h1>
            <p className="mt-1 text-xs text-amber-200/60 max-w-2xl">
              <strong className="text-amber-300">R</strong> comme{" "}
              <strong className="text-amber-100">Résultat</strong> —{" "}
              <strong className="text-amber-300">P</strong> comme{" "}
              <strong className="text-amber-100">Pourquoi</strong> —{" "}
              <strong className="text-amber-300">M</strong> comme{" "}
              <strong className="text-amber-100">Massif</strong>.
            </p>
          </div>

          <Link
            href="/capture"
            className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-5 py-2.5 text-sm font-bold text-amber-300 shadow-lg hover:bg-amber-500/30 transition-all flex items-center gap-2"
          >
            <span>+</span> Nouveau bloc RPM
          </Link>
        </div>

        {/* Navigation Semaine */}
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-[#121110] p-4 shadow-xl">
          <Link
            href={`/planifier?semaine=${prevWeekKey}`}
            className="rounded-xl border border-amber-500/20 bg-black/40 px-4 py-2 text-xs font-semibold text-amber-200/80 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
          >
            ‹ Semaine précédente
          </Link>

          <div className="flex items-center gap-2 text-sm font-bold text-amber-100">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Semaine du {formatDateFr(weekKey)}</span>
          </div>

          <Link
            href={`/planifier?semaine=${nextWeekKey}`}
            className="rounded-xl border border-amber-500/20 bg-black/40 px-4 py-2 text-xs font-semibold text-amber-200/80 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
          >
            Semaine suivante ›
          </Link>
        </div>

        {/* Liste des blocs de la semaine */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-amber-100 flex items-center justify-between">
            <span>Blocs actifs cette semaine</span>
            <span className="text-xs font-normal text-amber-200/50">
              {initialBlocks.length} bloc(s)
            </span>
          </h2>

          {initialBlocks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-500/20 p-12 text-center bg-[#121110] space-y-3">
              <p className="text-sm text-amber-200/60">
                Aucun bloc RPM planifié pour cette semaine.
              </p>
              <Link
                href="/capture"
                className="inline-block rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
              >
                Créer ou chunker une idée
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {initialBlocks.map((block) => {
                const totalActions = block.actions?.length || 0;
                const doneActions = block.actions?.filter((a) => a.isDone).length || 0;
                const progress = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;
                const mustCount = block.actions?.filter((a) => a.isMust).length || 0;
                const isContinuation = block.result.startsWith("[Suite]");

                return (
                  <div
                    key={block.id}
                    className="flex flex-col justify-between rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl space-y-4 hover:border-amber-500/40 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <div className="flex gap-2 items-center">
                          {isContinuation && (
                            <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-amber-300 flex items-center gap-1">
                              🔄 Suite
                            </span>
                          )}
                          {block.area && (
                            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-400">
                              {block.area.name}
                            </span>
                          )}
                          {block.role && (
                            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-300">
                              {block.role.name}
                            </span>
                          )}
                        </div>
                        <span className="text-amber-400 font-extrabold">{progress}%</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                          R · Résultat
                        </span>
                        <h3 className="text-base font-bold text-amber-100 mt-0.5">
                          {block.result.replace("[Suite] ", "")}
                        </h3>
                      </div>

                      {block.purpose && (
                        <div>
                          <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest block">
                            P · Pourquoi
                          </span>
                          <p className="text-xs text-amber-200/60 italic line-clamp-2 mt-0.5">
                            "{block.purpose}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-amber-500/10 flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="text-amber-200/60 space-x-2">
                        <span>{doneActions}/{totalActions} actions</span>
                        {mustCount > 0 && (
                          <span className="text-amber-400 font-semibold">★ {mustCount} MUST</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAction(block.id, false)}
                          disabled={loadingId === block.id}
                          className="rounded-lg border border-amber-500/20 bg-black/40 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200/70 hover:bg-amber-500/10 hover:text-amber-300 transition-all"
                          title="Dupliquer tout le bloc et ses actions pour la semaine prochaine"
                        >
                          Dupliquer ⎘
                        </button>
                        <button
                          onClick={() => handleAction(block.id, true)}
                          disabled={loadingId === block.id}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
                          title="Reporter uniquement les actions non terminées"
                        >
                          Reporter 🔄
                        </button>
                        <Link
                          href={`/planifier/${block.id}`}
                          className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all"
                        >
                          Ouvrir →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Historique Global */}
      <div className="rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
          <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Tous mes blocs RPM (Historique global)
          </h2>
          <span className="text-xs text-amber-200/50">{allBlocks.length} bloc(s) au total</span>
        </div>

        {allBlocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-500/10 p-8 text-center text-xs text-amber-200/40">
            Aucun bloc trouvé dans la base.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allBlocks.map((block) => (
              <div
                key={block.id}
                className="flex flex-col justify-between rounded-xl border border-amber-500/10 bg-black/40 p-4 space-y-3 hover:border-amber-500/30 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-amber-200/50">
                    <span>Semaine du {formatDateFr(block.weekStart)}</span>
                    <span className="uppercase text-[9px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
                      {block.status || "Actif"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-amber-100 text-sm line-clamp-2">
                    {block.result?.replace("[Suite] ", "") || block.title || "Bloc sans titre"}
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(block.id, false)}
                      className="text-xs text-amber-200/60 hover:text-amber-300 transition-all"
                      title="Dupliquer tout"
                    >
                      Dupliquer ⎘
                    </button>
                    <button
                      onClick={() => handleAction(block.id, true)}
                      className="text-xs text-amber-300 hover:text-amber-200 transition-all"
                      title="Reporter la suite"
                    >
                      Reporter 🔄
                    </button>
                  </div>
                  <Link
                    href={`/planifier/${block.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
                  >
                    Voir →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
