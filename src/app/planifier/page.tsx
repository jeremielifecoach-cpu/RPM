"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Flame,
  Clock,
  Plus,
  Calendar,
  CalendarDays,
  Copy,
  ArrowRightCircle,
  Trash2,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ActionInput {
  content: string;
  isMust: boolean;
  minutes: number;
  date: string;
}

function parseActionContent(rawContent: string) {
  const match = rawContent.match(/^\[(\d{4}-\d{2}-\d{2})\]\s*(.*)/);
  if (match) {
    const [_, dateStr, text] = match;
    const formattedDate = new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
    return { dateStr: formattedDate, text };
  }
  return { dateStr: null, text: rawContent };
}

function PlanifierContent() {
  const searchParams = useSearchParams();
  const [areas, setAreas] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [filterAreaId, setFilterAreaId] = useState("");
  const [result, setResult] = useState(searchParams.get("result") || "");
  const [purpose, setPurpose] = useState(searchParams.get("purpose") || "");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [targetBlockId, setTargetBlockId] = useState(searchParams.get("targetBlockId") || "");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);

  const todayStr = new Date().toISOString().split("T")[0];
  const [actionsList, setActionsList] = useState<ActionInput[]>([
    { content: searchParams.get("action") || "", isMust: false, minutes: 15, date: todayStr },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [resA, resB] = await Promise.all([
      fetch("/api/areas", { cache: "no-store" }),
      fetch("/api/blocks", { cache: "no-store" }),
    ]);
    if (resA.ok) setAreas(await resA.json());
    if (resB.ok) setBlocks(await resB.json());
  }

  function addActionRow() {
    setActionsList((prev) => [...prev, { content: "", isMust: false, minutes: 15, date: todayStr }]);
  }

  function updateActionRow(index: number, fields: Partial<ActionInput>) {
    setActionsList((prev) => prev.map((item, i) => (i === index ? { ...item, ...fields } : item)));
  }

  async function handleCreateOrAppend(e: React.FormEvent) {
    e.preventDefault();

    const formattedActions = actionsList
      .filter((a) => a.content.trim())
      .map((a) => ({
        ...a,
        content: a.date ? `[${a.date}] ${a.content.trim()}` : a.content.trim(),
      }));

    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetBlockId: targetBlockId || undefined,
        result,
        purpose,
        weekStart: scheduledDate,
        areaId: selectedAreaId || null,
        actionsList: formattedActions,
      }),
    });

    if (res.ok) {
      setResult("");
      setPurpose("");
      setTargetBlockId("");
      setActionsList([{ content: "", isMust: false, minutes: 15, date: todayStr }]);
      loadData();
    }
  }

  async function toggleAction(actionId: string, currentCompleted: boolean) {
    const nextCompleted = !currentCompleted;
    setBlocks((prevBlocks) =>
      prevBlocks.map((b) => ({
        ...b,
        actions: b.actions.map((a: any) => (a.id === actionId ? { ...a, completed: nextCompleted } : a)),
      }))
    );

    try {
      await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });
    } catch (err) {
      console.error("Erreur toggle action :", err);
    }
  }

  async function handleDeleteBlock(blockId: string) {
    try {
      const res = await fetch(`/api/blocks/${blockId}`, { method: "DELETE" });
      if (res.ok) setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBlockAction(blockId: string, actionType: "duplicate" | "carryOver") {
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, actionType }),
    });
    if (res.ok) loadData();
  }

  const filteredBlocks = filterAreaId
    ? blocks.filter((b) => b.areaId === filterAreaId)
    : blocks;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <Target className="h-7 w-7 text-amber-400" />
          Planification <span className="italic text-amber-300">RPM</span>
        </h1>
      </div>

      <form onSubmit={handleCreateOrAppend} className="space-y-5 rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl">
        {targetBlockId && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>Rattachement à un bloc RPM existant sélectionné</span>
            <button type="button" onClick={() => setTargetBlockId("")} className="underline">Créer un nouveau bloc à la place</button>
          </div>
        )}

        {!targetBlockId && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-amber-300 uppercase">1. Résultat Visé (R)</label>
              <input
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Ex : Lancer ma nouvelle offre"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-zinc-100 outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-amber-300 uppercase">2. Raison d&apos;être / Pourquoi (P)</label>
              <textarea
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Pourquoi est-ce crucial ?"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-zinc-100 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Date globale du bloc</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-zinc-200">
                <Calendar className="h-4 w-4 text-amber-400" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-transparent text-xs text-zinc-100 outline-none cursor-pointer w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Domaine de Vie</label>
              <select value={selectedAreaId} onChange={(e) => setSelectedAreaId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-zinc-200 outline-none">
                <option value="">Sélectionner un domaine</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="space-y-3 border-t border-white/10 pt-3">
          <label className="text-xs font-bold text-amber-300 uppercase block">3. Actions Massives (M) & Dates Précises</label>

          {actionsList.map((act, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <input
                value={act.content}
                onChange={(e) => updateActionRow(index, { content: e.target.value })}
                placeholder={`Action #${index + 1}`}
                className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-zinc-100 outline-none"
              />

              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 px-2.5 py-2 text-xs text-zinc-300">
                <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
                <input
                  type="date"
                  value={act.date}
                  onChange={(e) => updateActionRow(index, { date: e.target.value })}
                  className="bg-transparent text-xs text-zinc-100 outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 px-2.5 py-2 text-xs text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <select value={act.minutes} onChange={(e) => updateActionRow(index, { minutes: Number(e.target.value) })} className="bg-transparent outline-none cursor-pointer">
                  <option value={5} className="bg-zinc-900">5m</option>
                  <option value={15} className="bg-zinc-900">15m</option>
                  <option value={30} className="bg-zinc-900">30m</option>
                  <option value={60} className="bg-zinc-900">1h</option>
                  <option value={120} className="bg-zinc-900">2h</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => updateActionRow(index, { isMust: !act.isMust })}
                className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold ${
                  act.isMust ? "border-rose-500/50 bg-rose-500/20 text-rose-300" : "border-white/10 text-zinc-500"
                }`}
              >
                <Flame className="h-3.5 w-3.5" /> MUST
              </button>
            </div>
          ))}

          <button type="button" onClick={addActionRow} className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Ajouter une action
          </button>
        </div>

        <button type="submit" className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400">
          {targetBlockId ? "Ajouter l'action au bloc existant" : "Créer le bloc RPM"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-zinc-300 uppercase">Blocs RPM en cours ({filteredBlocks.length})</h2>

          <div className="flex items-center gap-2 bg-[#0d0d10] border border-white/10 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-amber-400" />
            <select
              value={filterAreaId}
              onChange={(e) => setFilterAreaId(e.target.value)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900">Tous les domaines</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id} className="bg-zinc-900">
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredBlocks.map((b) => {
          const areaObj = areas.find((a) => a.id === b.areaId);

          return (
            <div key={b.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Résultat</span>
                    {areaObj && (
                      <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        {areaObj.name}
                      </span>
                    )}
                    {b.weekStart && (
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                        📅 {b.weekStart}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">{b.result}</h3>
                  {b.purpose && <p className="text-xs italic text-zinc-400">&laquo; {b.purpose} &raquo;</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleBlockAction(b.id, "duplicate")} className="p-1.5 text-zinc-400 hover:text-amber-300" title="Dupliquer">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleBlockAction(b.id, "carryOver")} className="p-1.5 text-zinc-400 hover:text-amber-300" title="Report S+1">
                    <ArrowRightCircle className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteBlock(b.id)} className="p-1.5 text-zinc-600 hover:text-rose-400" title="Supprimer le bloc">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {b.actions.map((act: any) => {
                  const { dateStr, text } = parseActionContent(act.content);
                  const isCompleted = Boolean(act.completed);

                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleAction(act.id, isCompleted)}
                      className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 text-xs text-zinc-200 cursor-pointer hover:border hover:border-amber-400/40 transition-all select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        {isCompleted ? (
                          <CheckSquare className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                        )}
                        {act.isMust && <span className="text-rose-400 font-bold flex-shrink-0">🔥 MUST</span>}
                        <span className={isCompleted ? "line-through text-zinc-500" : "font-medium"}>
                          {text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                        {dateStr && <span className="text-amber-300/80 font-semibold">📅 {dateStr}</span>}
                        {act.minutes && <span>⏱️ {act.minutes}m</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlanifierPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Chargement...</div>}>
      <PlanifierContent />
    </Suspense>
  );
      }
                   
