"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Plus, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface AreaItem {
  id: string;
  name: string;
  focus: string | null;
  score: number | null;
  isPriority?: boolean | null;
}

export default function DomainesPage() {
  const [areasList, setAreasList] = useState<AreaItem[]>([]);
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAreas();
  }, []);

  async function loadAreas() {
    try {
      const res = await fetch("/api/areas", { cache: "no-store" });
      if (res.ok) setAreasList(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), focus: focus.trim(), score: 5 }),
      });
      if (res.ok) {
        setName("");
        setFocus("");
        loadAreas();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateArea(id: string, updates: Partial<AreaItem>) {
    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setAreasList((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/areas/${id}`, { method: "DELETE" });
      if (res.ok) setAreasList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100">
          Domaines de <span className="italic text-amber-300">Vie</span>
        </h1>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-4 shadow-xl">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nouveau Domaine (ex: Santé, Carrière...)"
          className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-zinc-100 outline-none"
        />
        <input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="Intention / Focus"
          className="min-w-[180px] flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-zinc-100 outline-none"
        />
        <button type="submit" disabled={!name.trim()} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400">
          <Plus className="h-4 w-4 inline mr-1" /> Ajouter
        </button>
      </form>

      {loading ? (
        <div className="p-8 text-center text-xs text-zinc-500">Chargement des domaines...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {areasList.map((area) => {
            const currentScore = area.score ?? 5;
            const isPriority = area.isPriority ?? false;

            return (
              <div key={area.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-100">{area.name}</h3>
                    {area.focus && <p className="text-xs text-zinc-500">{area.focus}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateArea(area.id, { isPriority: !isPriority })}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                        isPriority ? "border-amber-400/50 bg-amber-400/15 text-amber-300" : "border-white/10 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${isPriority ? "fill-amber-300" : ""}`} />
                      {isPriority ? "Prioritaire" : "Prioriser"}
                    </button>
                    <button onClick={() => handleDelete(area.id)} className="p-1 text-zinc-600 hover:text-rose-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-400">Satisfaction :</span>
                    <span className="text-amber-400 font-bold">{currentScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="10"
                    value={currentScore}
                    onChange={(e) => setAreasList((prev) => prev.map((a) => (a.id === area.id ? { ...a, score: Number(e.target.value) } : a)))}
                    onMouseUp={(e) => updateArea(area.id, { score: Number((e.target as HTMLInputElement).value) })}
                    className="w-full accent-amber-400 bg-zinc-800"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
