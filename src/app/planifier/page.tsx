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
  Square,
  Pencil,
  Save,
  X,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ActionInput {
  content: string;
  isMust: boolean;
  minutes: number;
  date: string;
}

type ActionStatus = "todo" | "in_progress" | "postponed" | "done";

function parseAction(rawContent: string, isCompletedFromDb?: boolean | null) {
  let content = rawContent || "";
  let dateStr = "";
  let status: ActionStatus = isCompletedFromDb ? "done" : "todo";

  const dateMatch = content.match(/^\[(\d{4}-\d{2}-\d{2})\]/);
  if (dateMatch) {
    dateStr = dateMatch[1];
    content = content.replace(/^\[\d{4}-\d{2}-\d{2}\]/, "").trim();
  }

  const statusMatch = content.match(/^\[STATUS:(todo\vert{}in_progress\vert{}postponed\vert{}done)\]/);
  if (statusMatch) {
    if (!isCompletedFromDb) status = statusMatch[1] as ActionStatus;
    content = content.replace(/^\[STATUS:(todo\vert{}in_progress\vert{}postponed\vert{}done)\]/, "").trim();
  }

  return { dateStr, status, cleanText: content };
}

function buildActionContent(dateStr: string, status: ActionStatus, cleanText: string) {
  let res = cleanText.trim();
  if (status && status !== "todo" && status !== "done") res = `[STATUS:${status}] ${res}`;
  if (dateStr) res = `[${dateStr}] ${res}`;
  return res;
}

function addDays(dateStr: string, days: number): string {
  const base = dateStr ? new Date(dateStr) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().split("T")[0];
}

function PlanifierContent() {
  const searchParams = useSearchParams();
  const captureId = searchParams.get("captureId");
  const initialDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [areas, setAreas] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [filterAreaId, setFilterAreaId] = useState("");

  const [result, setResult] = useState(searchParams.get("result") || "");
  const [purpose, setPurpose] = useState(searchParams.get("purpose") || "");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [targetBlockId, setTargetBlockId] = useState(searchParams.get("targetBlockId") || "");
  const [scheduledDate, setScheduledDate] = useState(initialDate);

  const [actionsList, setActionsList] = useState<ActionInput[]>([
    { content: searchParams.get("action") || "", isMust: false, minutes: 15, date: initialDate },
  ]);

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editBlockData, setEditBlockData] = useState<{ result: string; purpose: string; areaId: string; weekStart: string }>({
    result: "",
    purpose: "",
    areaId: "",
    weekStart: "",
  });

  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editActionData, setEditActionData] = useState<{ cleanText: string; dateStr: string; minutes: number; isMust: boolean }>({
    cleanText: "",
    dateStr: "",
    minutes: 15,
    isMust: false,
  });

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
    setActionsList((prev) => [...prev, { content: "", isMust: false, minutes: 15, date: scheduledDate }]);
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
        content: buildActionContent(a.date, "todo", a.content),
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
      if (captureId) {
        const capRes = await fetch("/api/captures");
        if (capRes.ok) {
          const caps = await capRes.json();
          const cap = caps.find((c: any) => c.id === captureId);
          if (cap && !cap.content.startsWith("[ARCHIVED] ")) {
            await fetch(`/api/captures/${captureId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: `[ARCHIVED] ${cap.content}` }),
            });
          }
        }
      }
      setResult("");
      setPurpose("");
      setTargetBlockId("");
      setActionsList([{ content: "", isMust: false, minutes: 15, date: new Date().toISOString().split("T")[0] }]);
      loadData();
    }
  }

  function startEditingBlock(block: any) {
    setEditingBlockId(block.id);
    setEditBlockData({
      result: block.result || "",
      purpose: block.purpose || "",
      areaId: block.areaId || "",
      weekStart: block.weekStart || new Date().toISOString().split("T")[0],
    });
  }

  async function saveBlockChanges(blockId: string) {
    await fetch(`/api/blocks/${blockId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editBlockData),
    });
    setEditingBlockId(null);
    loadData();
  }

  async function updateBlockDateDirect(blockId: string, newDate: string) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, weekStart: newDate } : b))
    );
    await fetch(`/api/blocks/${blockId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: newDate }),
    });
  }

  async function handleDeleteBlock(blockId: string) {
    const res = await fetch(`/api/blocks/${blockId}`, { method: "DELETE" });
    if (res.ok) setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }

  async function handleBlockAction(blockId: string, actionType: "duplicate" | "carryOver") {
    await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, actionType }),
    });
    loadData();
  }

  async function updateActionStatus(act: any, newStatus: ActionStatus, newDateStr?: string) {
    const { dateStr, cleanText } = parseAction(act.content, act.completed);
    const targetDate = newDateStr !== undefined ? newDateStr : dateStr;
    const isCompleted = newStatus === "done";
    const newContent = buildActionContent(targetDate, newStatus, cleanText);

    setBlocks((prevBlocks) =>
      prevBlocks.map((b) => ({
        ...b,
        actions: b.actions.map((a: any) => (a.id === act.id ? { ...a, content: newContent, completed: isCompleted } : a)),
      }))
    );
    await fetch(`/api/actions/${act.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent, completed: isCompleted }),
    });
  }

  async function updateActionDateDirect(act: any, newDateStr: string) {
    const { status, cleanText } = parseAction(act.content, act.completed);
    const newContent = buildActionContent(newDateStr, status, cleanText);

    setBlocks((prevBlocks) =>
      prevBlocks.map((b) => ({
        ...b,
        actions: b.actions.map((a: any) => (a.id === act.id ? { ...a, content: newContent } : a)),
      }))
    );
    await fetch(`/api/actions/${act.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    });
  }

  function startEditingAction(act: any) {
    const { dateStr, cleanText } = parseAction(act.content, act.completed);
    setEditingActionId(act.id);
    setEditActionData({
      cleanText,
      dateStr: dateStr || new Date().toISOString().split("T")[0],
      minutes: act.minutes || 15,
      isMust: Boolean(act.isMust),
    });
  }

  async function saveActionChanges(act: any) {
    const { status } = parseAction(act.content, act.completed);
    const newContent = buildActionContent(editActionData.dateStr, status, editActionData.cleanText);

    await fetch(`/api/actions/${act.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent, minutes: editActionData.minutes, isMust: editActionData.isMust }),
    });
    setEditingActionId(null);
    loadData();
  }

  const filteredBlocks = filterAreaId ? blocks.filter((b) => b.areaId === filterAreaId) : blocks;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <Target className="h-7 w-7 text-amber-400" /> Planification <span className="italic text-amber-300">RPM</span>
        </h1>
      </div>

      <form onSubmit={handleCreateOrAppend} className="space-y-5 rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl">
        {targetBlockId && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>Rattachement à un bloc RPM existant sélectionné</span>
            <button type="button" onClick={() => setTargetBlockId("")} className="underline">
              Créer un nouveau bloc à la place
            </button>
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
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-zinc-200 cursor-pointer">
                <Calendar className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-transparent text-xs text-zinc-100 outline-none cursor-pointer w-full [color-scheme:dark]"
                />
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Domaine de Vie</label>
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-zinc-200 outline-none"
              >
                <option value="">Sélectionner un domaine</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
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
              <label className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 px-2.5 py-2 text-xs text-zinc-300 cursor-pointer">
                <CalendarDays className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <input
                  type="date"
                  value={act.date}
                  onChange={(e) => updateActionRow(index, { date: e.target.value })}
                  className="bg-transparent text-xs text-zinc-100 outline-none cursor-pointer [color-scheme:dark]"
                />
              </label>
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 px-2.5 py-2 text-xs text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <select
                  value={act.minutes}
                  onChange={(e) => updateActionRow(index, { minutes: Number(e.target.value) })}
                  className="bg-transparent outline-none cursor-pointer"
                >
                  <option value={5}>5m</option>
                  <option value={15}>15m</option>
                  <option value={30}>30m</option>
                  <option value={60}>1h</option>
                  <option value={120}>2h</option>
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
              <option value="" className="bg-zinc-900">
                Tous les domaines
              </option>
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
          const isEditing = editingBlockId === b.id;

          return (
            <div key={b.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-5 space-y-4 shadow-lg">
              <div className="border-b border-white/10 pb-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-400 uppercase">Résultat Visé (R)</label>
                      <input
                        value={editBlockData.result}
                        onChange={(e) => setEditBlockData({ ...editBlockData, result: e.target.value })}
                        className="w-full rounded-xl border border-amber-500/40 bg-black/60 p-2 text-xs text-zinc-100 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-400 uppercase">Pourquoi (P)</label>
                      <textarea
                        rows={2}
                        value={editBlockData.purpose}
                        onChange={(e) => setEditBlockData({ ...editBlockData, purpose: e.target.value })}
                        className="w-full rounded-xl border border-amber-500/40 bg-black/60 p-2 text-xs text-zinc-100 outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={editBlockData.areaId}
                        onChange={(e) => setEditBlockData({ ...editBlockData, areaId: e.target.value })}
                        className="rounded-xl border border-white/10 bg-black/60 p-2 text-xs text-zinc-200 outline-none"
                      >
                        <option value="">Sélectionner un domaine</option>
                        {areas.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={editBlockData.weekStart}
                        onChange={(e) => setEditBlockData({ ...editBlockData, weekStart: e.target.value })}
                        className="rounded-xl border border-white/10 bg-black/60 p-2 text-xs text-zinc-100 outline-none [color-scheme:dark]"
                      />
                      <button
                        onClick={() => saveBlockChanges(b.id)}
                        className="flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400"
                      >
                        <Save className="h-3.5 w-3.5" /> Enregistrer le bloc
                      </button>
                      <button onClick={() => setEditingBlockId(null)} className="p-1.5 text-zinc-400 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">Résultat</span>
                        {areaObj && (
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            {areaObj.name}
                          </span>
                        )}
                        {/* Date cliquable directement sur le bloc */}
                        <label className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300 flex items-center gap-1 cursor-pointer hover:bg-white/20">
                          📅
                          <input
                            type="date"
                            value={b.weekStart || new Date().toISOString().split("T")[0]}
                            onChange={(e) => updateBlockDateDirect(b.id, e.target.value)}
                            className="bg-transparent text-zinc-200 font-bold outline-none cursor-pointer text-[10px] [color-scheme:dark]"
                          />
                        </label>
                      </div>
                      <h3 className="text-base font-bold text-zinc-100 mt-0.5">{b.result}</h3>
                      {b.purpose && <p className="text-xs italic text-zinc-400">&laquo; {b.purpose} &raquo;</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEditingBlock(b)} className="p-1.5 text-zinc-400 hover:text-amber-300" title="Éditer le bloc">
                        <Pencil className="h-4 w-4" />
                      </button>
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
                )}
              </div>

              <div className="space-y-2">
                {b.actions.map((act: any) => {
                  const { dateStr, status, cleanText } = parseAction(act.content, act.completed);
                  const isActionEditing = editingActionId === act.id;

                  return (
                    <div key={act.id} className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs text-zinc-200">
                      {isActionEditing ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={editActionData.cleanText}
                            onChange={(e) => setEditActionData({ ...editActionData, cleanText: e.target.value })}
                            className="flex-1 rounded-lg border border-amber-500/40 bg-black/60 px-2.5 py-1 text-xs text-zinc-100 outline-none"
                          />
                          <input
                            type="date"
                            value={editActionData.dateStr}
                            onChange={(e) => setEditActionData({ ...editActionData, dateStr: e.target.value })}
                            className="rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs text-zinc-100 outline-none [color-scheme:dark]"
                          />
                          <select
                            value={editActionData.minutes}
                            onChange={(e) => setEditActionData({ ...editActionData, minutes: Number(e.target.value) })}
                            className="rounded-lg border border-white/10 bg-black/60 p-1 text-xs text-zinc-100 outline-none"
                          >
                            <option value={5}>5m</option>
                            <option value={15}>15m</option>
                            <option value={30}>30m</option>
                            <option value={60}>1h</option>
                            <option value={120}>2h</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setEditActionData({ ...editActionData, isMust: !editActionData.isMust })}
                            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold ${
                              editActionData.isMust ? "border-rose-500/50 bg-rose-500/20 text-rose-300" : "border-white/10 text-zinc-500"
                            }`}
                          >
                            <Flame className="h-3.5 w-3.5" /> MUST
                          </button>
                          <button onClick={() => saveActionChanges(act)} className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-black">
                            <Save className="h-3.5 w-3.5 inline mr-1" /> OK
                          </button>
                          <button onClick={() => setEditingActionId(null)} className="p-1 text-zinc-400">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-lg p-1">
                              <button
                                onClick={() => updateActionStatus(act, "todo")}
                                title="À faire"
                                className={`px-1.5 py-0.5 rounded text-xs ${
                                  status === "todo" ? "bg-zinc-700 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                <Square className="h-3.5 w-3.5 inline" />
                              </button>
                              <button
                                onClick={() => updateActionStatus(act, "in_progress")}
                                title="En cours"
                                className={`px-1.5 py-0.5 rounded text-xs ${status === "in_progress" ? "bg-sky-500/20 font-bold" : "opacity-60 hover:opacity-100"}`}
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => {
                                  const nextDate = addDays(dateStr, 1);
                                  updateActionStatus(act, "postponed", nextDate);
                                }}
                                title="Reporté au lendemain (+1 jour)"
                                className={`px-1.5 py-0.5 rounded text-xs ${status === "postponed" ? "bg-amber-500/20 font-bold" : "opacity-60 hover:opacity-100"}`}
                              >
                                ➡️
                              </button>
                              <button
                                onClick={() => updateActionStatus(act, "done")}
                                title="Fait"
                                className={`px-1.5 py-0.5 rounded text-xs ${status === "done" ? "bg-rose-500/20 font-bold" : "opacity-60 hover:opacity-100"}`}
                              >
                                ❌
                              </button>
                            </div>
                            {act.isMust && <span className="text-rose-400 font-bold text-[11px]">🔥 MUST</span>}
                            <span className={status === "done" ? "line-through text-zinc-500" : "font-medium"}>{cleanText}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                            {/* Date cliquable directement sur chaque ligne d'action */}
                            <label className="text-amber-300/80 font-semibold flex items-center gap-1 cursor-pointer hover:text-amber-200 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              📅
                              <input
                                type="date"
                                value={dateStr || new Date().toISOString().split("T")[0]}
                                onChange={(e) => updateActionDateDirect(act, e.target.value)}
                                className="bg-transparent text-amber-300 font-semibold outline-none cursor-pointer text-[11px] [color-scheme:dark]"
                              />
                            </label>
                            {act.minutes && <span>⏱️ {act.minutes}m</span>}
                            <button onClick={() => startEditingAction(act)} className="p-1 text-zinc-500 hover:text-amber-300" title="Modifier l'action">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
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
