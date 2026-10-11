"use client";

import { useState } from "react";
import Link from "next/link";

type Block = { id: string; result: string; status: string | null; weekStart: string | null };
type Action = { id: string; blockId: string | null; content: string; completed: boolean; isMust: boolean };
type Review = { date: string; content: string };

function weekBounds() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const today = new Date(`${part("year")}-${part("month")}-${part("day")}T12:00:00Z`);
  today.setUTCDate(today.getUTCDate() - (today.getUTCDay() + 6) % 7);
  const monday = today.toISOString().slice(0, 10);
  today.setUTCDate(today.getUTCDate() + 6);
  return { monday, sunday: today.toISOString().slice(0, 10) };
}

export function BilanClient({ blocks, actions, reviews }: { blocks: Block[]; actions: Action[]; reviews: Review[] }) {
  const { monday, sunday } = weekBounds();
  const key = `bilan-${monday}`;
  const saved = reviews.find((r) => r.date === key);
  let previous = { victories: "", reflections: "", gratitudes: [] as string[] };
  try {
    if (saved) previous = { ...previous, ...JSON.parse(saved.content) };
  } catch { /* Ancienne entrée non structurée : le formulaire reste disponible. */ }

  const [victories, setVictories] = useState(previous.victories);
  const [lessons, setLessons] = useState(previous.reflections);
  const [next, setNext] = useState(previous.gratitudes?.[0] || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const blockById = new Map(blocks.map((b) => [b.id, b]));
  const weekly = actions.filter((a) => {
    const date = a.content.match(/^\[(\d{4}-\d{2}-\d{2})\]/)?.[1];
    return date && date >= monday && date <= sunday;
  });
  const done = weekly.filter((a) => a.completed);
  const remaining = weekly.filter((a) => !a.completed);
  const openBlocks = blocks.filter((b) => b.status !== "completed" && (b.weekStart === monday || b.weekStart === null));
  const clean = (a: Action) => a.content.replace(/^\[\d{4}-\d{2}-\d{2}\]\s*/, "").replace(/^\[STATUS:[^\]]+\]\s*/, "");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!victories.trim() && !lessons.trim() && !next.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: key, victories: victories.trim(), reflections: lessons.trim(), gratitudes: next.trim() ? [next.trim()] : [], scoreDay: 8 }) });
      if (!res.ok) throw new Error("Échec de l'enregistrement");
      setMessage("Bilan enregistré. Tu peux le modifier ici pendant la semaine.");
    } catch { setMessage("Enregistrement impossible. Réessaie."); }
    finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 text-zinc-100">
    <div><Link href="/" className="text-xs text-amber-300 hover:underline">← Tableau de bord</Link>
      <h1 className="mt-3 font-display text-3xl font-bold">Bilan de la semaine</h1>
      <p className="mt-1 text-sm text-zinc-400">Du {monday} au {sunday} · état actuel des actions prévues cette semaine</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-[#141210] p-4"><p className="text-xs text-zinc-400">Actions prévues</p><p className="text-2xl font-bold text-amber-300">{weekly.length}</p></div>
      <div className="rounded-xl border border-white/10 bg-[#141210] p-4"><p className="text-xs text-zinc-400">Terminées</p><p className="text-2xl font-bold text-emerald-400">{done.length}</p></div>
      <div className="rounded-xl border border-white/10 bg-[#141210] p-4"><p className="text-xs text-zinc-400">À décider</p><p className="text-2xl font-bold text-rose-300">{remaining.length}</p></div>
    </div>
    <section className="rounded-2xl border border-white/10 bg-[#141210] p-5 space-y-4">
      <h2 className="font-bold text-amber-200">Actions terminées</h2>
      {done.length ? <ul className="space-y-2">{done.map((a) => <li key={a.id} className="text-sm">✓ {clean(a)} <span className="block pl-4 text-xs text-zinc-500">{blockById.get(a.blockId || "")?.result}</span></li>)}</ul> : <p className="text-sm text-zinc-500">Aucune action datée terminée cette semaine.</p>}
      <h2 className="pt-2 font-bold text-amber-200">À terminer ou replanifier</h2>
      {remaining.length ? <ul className="space-y-2">{remaining.map((a) => <li key={a.id} className="text-sm">□ {clean(a)} {a.isMust && <span className="text-amber-300 text-xs">MUST</span>} <Link href={`/planifier/${a.blockId}`} className="block pl-4 text-xs text-zinc-400 hover:text-amber-300">{blockById.get(a.blockId || "")?.result || "Ouvrir le bloc"} →</Link></li>)}</ul> : <p className="text-sm text-zinc-500">Aucune action datée en attente cette semaine.</p>}
    </section>
    <section className="rounded-2xl border border-white/10 bg-[#141210] p-5">
      <h2 className="font-bold text-amber-200">Blocs encore ouverts ({openBlocks.length})</h2>
      <ul className="mt-3 space-y-2">{openBlocks.map((b) => <li key={b.id}><Link href={`/planifier/${b.id}`} className="text-sm text-zinc-200 hover:text-amber-300">{b.result} →</Link></li>)}</ul>
      <Link href="/planifier" className="mt-4 inline-block text-xs font-bold text-amber-300 hover:underline">Planifier la suite →</Link>
    </section>
    <form onSubmit={save} className="rounded-2xl border border-amber-500/20 bg-[#141210] p-5 space-y-4">
      <h2 className="font-bold text-amber-200">Ta décision pour la suite</h2>
      <label className="block text-sm">Quelle victoire mérite d’être célébrée ?<textarea value={victories} onChange={(e) => setVictories(e.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-zinc-100" /></label>
      <label className="block text-sm">Qu’as-tu appris ou qu’est-ce qui a freiné le résultat ?<textarea value={lessons} onChange={(e) => setLessons(e.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-zinc-100" /></label>
      <label className="block text-sm">Quel résultat prioritaire choisis-tu pour la semaine prochaine ?<textarea value={next} onChange={(e) => setNext(e.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-zinc-100" /></label>
      <button disabled={saving || (!victories.trim() && !lessons.trim() && !next.trim())} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{saving ? "Enregistrement…" : "Enregistrer mon bilan"}</button>
      {message && <p role="status" className="text-sm text-amber-200">{message}</p>}
    </form>
  </div>;
}
