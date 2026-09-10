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
  const [blocksList, setBlocksList] = useState<ExtendedBlock[]>(initialBlocks);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [newActionInputs, setNewActionInputs] = useState<{ [blockId: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    setBlocksList(initialBlocks);
  }, [initialBlocks]);

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

  const handleDuplicateOrReport = async (blockId: string, isReport: boolean) => {
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

  const handleToggleVictory = async (blockId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "victory" ? "active" : "victory";
    const res = await fetch(`/api/blocks/${blockId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setBlocksList(
        blocksList.map((b) => (b.id === blockId ? { ...b, status: newStatus } : b))
      );
      router.refresh();
    }
  };

  const handleToggleActionDone = async (blockId: string, actionId: string, currentDone: boolean) => {
    const res = await fetch(`/api/actions/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone: !currentDone }),
    });

    if (res.ok) {
      setBlocksList(
        blocksList.map((b) => {
          if (b.id !== blockId) return b;
          const updatedActions = b.actions?.map((a) =>
            a.id === actionId ? { ...a, isDone: !currentDone } : a
          );
          return { ...b, actions: updatedActions };
        })
      );
    }
  };

  const handleAddExpressAction = async (blockId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = newActionInputs[blockId]?.trim();
    if (!content) return;

    const res = await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, content }),
    });

    if (res.ok) {
      const createdAction = await res.json();
      setBlocksList(
        blocksList.map((b) => {
          if (b.id !== blockId) return b;
          return { ...b, actions: [...(b.actions || []), createdAction] };
        })
      );
      setNewActionInputs({ ...newActionInputs, [blockId]: "" });
    }
  };

  const filteredBlocks = blocksList.filter((b) => {
    if (selectedAreaId === "all") return true;
    return b.areaId === selectedAreaId;
  });

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

        {/* Filtres par Domaine de vie */}
        <div className="flex flex-wrap items-center gap-2 border-b border-amber-500/10 pb-4">
          <span className="text-xs font-semibold text-amber-200/50 mr-2">Filtrer :</span>
          <button
            onClick={() => setSelectedAreaId("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedAreaId === "all"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-black/30 text-amber-200/60 border border-amber-500/10 hover:text-amber-200"
            }`}
          >
            Tous les domaines ({blocksList.length})
          </button>
          {areas.map((area) => {
            const count = blocksList.filter((b) => b.areaId === area.id).length;
            return (
              <button
                key={area.id}
                onClick={() => setSelectedAreaId(area.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedAreaId === area.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-black/30 text-amber-200/60 border border-amber-500/10 hover:text-amber-200"
                }`}
              >
                {area.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Liste des blocs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-100">Blocs actifs cette semaine</h2>
            <span className="text-xs font-normal text-amber-200/50">
              {filteredBlocks.length} bloc(s) affiché(s)
            </span>
          </div>

          {filteredBlocks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-500/20 p-12 text-center bg-[#121110] space-y-3">
              <p className="text-sm text-amber-200/60">
                Aucun bloc RPM pour ce filtre cette semaine.
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
              {filteredBlocks.map((block) => {
                const totalActions = block.actions?.length || 0;
                const doneActions = block.actions?.filter((a) => a.isDone).length || 0;
                const progress = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;
                const mustCount = block.actions?.filter((a) => a.isMust).length || 0;
                const isContinuation = block.result.startsWith("[Suite]");
                const isVictory = block.status === "victory";

                return (
                  <div
                    key={block.id}
                    className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xl space-y-4 transition-all ${
                      isVictory
                        ? "border-emerald-500/40 bg-emerald-950/20"
                        : "border-amber-500/20 bg-[#121110] hover:border-amber-500/40"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <div className="flex gap-2 items-center">
                          {isVictory ? (
                            <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-emerald-300 font-extrabold flex items-center gap-1">
                              🏆 VICTOIRE ATTEINTE
                            </span>
                          ) : (
                            <>
                              {isContinuation && (
                                <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-amber-300">
                                  🔄 Suite
                                </span>
                              )}
                              {block.area && (
                                <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-400">
                                  {block.area.name}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <span className={isVictory ? "text-emerald-400 font-extrabold" : "text-amber-400 font-extrabold"}>
                          {progress}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                          R · Résultat
                        </span>
                        <h3 className={`text-base font-bold mt-0.5 ${isVictory ? "text-emerald-100 line-through decoration-emerald-500/50" : "text-amber-100"}`}>
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

                      {/* Checklist rapide des actions */}
                      <div className="space-y-1.5 pt-2 border-t border-amber-500/10">
                        <span className="text-[10px] font-bold text-amber-200/50 uppercase tracking-wider block">
                          Actions ({doneActions}/{totalActions})
                        </span>
                        {block.actions && block.actions.length > 0 ? (
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {block.actions.map((act) => (
                              <div
                                key={act.id}
                                onClick={() => handleToggleActionDone(block.id, act.id, act.isDone)}
                                className="flex items-center gap-2 text-xs p-1.5 rounded bg-black/40 border border-amber-500/10 hover:border-amber-500/30 cursor-pointer transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={act.isDone}
                                  onChange={() => {}}
                                  className="rounded border-amber-500/30 bg-black text-amber-500 focus:ring-0"
                                />
                                <span
                                  className={`flex-1 ${
                                    act.isDone
                                      ? "line-through text-amber-200/40"
                                      : "text-amber-100 font-medium"
                                  }`}
                                >
                                  {act.content}
                                </span>
                                {act.isMust && (
                                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1 rounded">
                                    MUST
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-amber-200/40 italic">Aucune action ajoutée.</p>
                        )}

                        {/* Ajout express d'action */}
                        <form
                          onSubmit={(e) => handleAddExpressAction(block.id, e)}
                          className="flex gap-2 pt-1"
                        >
                          <input
                            type="text"
                            placeholder="+ Ajouter une action..."
                            value={newActionInputs[block.id] || ""}
                            onChange={(e) =>
                              setNewActionInputs({
                                ...newActionInputs,
                                [block.id]: e.target.value,
                              })
                            }
                            className="flex-1 rounded-lg border border-amber-500/20 bg-black/50 px-2.5 py-1 text-xs text-amber-100 placeholder:text-amber-200/30 focus:outline-none focus:border-amber-500/50"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-all"
                          >
                            Ajouter
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-500/10 flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="text-amber-200/60 space-x-2">
                        {mustCount > 0 && (
                          <span className="text-amber-400 font-semibold">★ {mustCount} MUST</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleVictory(block.id, block.status)}
                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                            isVictory
                              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                              : "border-amber-500/20 bg-black/40 text-amber-200/70 hover:bg-amber-500/10 hover:text-amber-300"
                          }`}
                        >
                          {isVictory ? "🏆 Gagné" : "🏆 Victoire"}
                        </button>
                        <button
                          onClick={() => handleDuplicateOrReport(block.id, false)}
                          disabled={loadingId === block.id}
                          className="rounded-lg border border-amber-500/20 bg-black/40 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200/70 hover:bg-amber-500/10 hover:text-amber-300 transition-all"
                        >
                          Dupliquer ⎘
                        </button>
                        <button
                          onClick={() => handleDuplicateOrReport(block.id, true)}
                          disabled={loadingId === block.id}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
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
                      onClick={() => handleDuplicateOrReport(block.id, false)}
                      className="text-xs text-amber-200/60 hover:text-amber-300 transition-all"
                    >
                      Dupliquer ⎘
                    </button>
                    <button
                      onClick={() => handleDuplicateOrReport(block.id, true)}
                      className="text-xs text-amber-300 hover:text-amber-200 transition-all"
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
