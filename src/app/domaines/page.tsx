"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Save, Check } from "lucide-react";

interface AreaItem {
  id: string;
  name: string;
  focus: string | null;
  score: number | null;
  isPriority?: boolean | null;
}

export default function DomainesPage() {
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAreas() {
      try {
        // Bypass du cache pour assurer la persistance
        const res = await fetch("/api/areas", { cache: "no-store" });
        if (res.ok) setAreas(await res.json());
      } catch (err) {
        console.error("Erreur domaines:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAreas();
  }, []);

  async function updateArea(id: string, updates: Partial<AreaItem>) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
        setSavedId(id);
        setTimeout(() => setSavedId(null), 1500);
      }
    } catch (err) {
      console.error("Erreur sauvegarde :", err);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au tableau de bord
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100">
            Tes <span className="italic text-amber-300">Domaines de Vie</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Évalue ta satisfaction (1-10) et coche tes 3 domaines prioritaires du moment.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-8 text-center text-sm text-zinc-500">
          Chargement des domaines...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {areas.map((area) => {
            const currentScore = area.score ?? 5;
            const isPriority = area.isPriority ?? false;

            return (
              <div
                key={area.id}
                className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0d0d10]/80 p-5 shadow-xl transition-all hover:border-amber-500/30"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-zinc-100">{area.name}</h3>
                      {area.focus && <p className="text-xs text-zinc-500">{area.focus}</p>}
                    </div>

                    <button
                      onClick={() => updateArea(area.id, { isPriority: !isPriority })}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                        isPriority
                          ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                          : "border-white/10 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${isPriority ? "fill-amber-300" : ""}`} />
                      Prioritaire
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-400">Satisfaction :</span>
                      <span className="font-bold text-amber-400 tabular-nums">{currentScore}/10</span>
                    </div>

                    <input
                      type="range"
                      min="1" max="10"
                      value={currentScore}
                      onChange={(e) => setAreas((prev) => prev.map((a) => a.id === area.id ? { ...a, score: Number(e.target.value) } : a))}
                      onMouseUp={(e) => updateArea(area.id, { score: Number((e.target as HTMLInputElement).value) })}
                      onTouchEnd={(e) => updateArea(area.id, { score: Number((e.target as HTMLInputElement).value) })}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-amber-400"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-white/[0.06] pt-3">
                  {savedId === area.id ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Enregistré
                    </span>
                  ) : savingId === area.id ? (
                    <span className="text-xs text-zinc-500">Sauvegarde...</span>
                  ) : (
                    <button
                      onClick={() => updateArea(area.id, { score: currentScore, isPriority })}
                      className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-amber-300"
                    >
                      <Save className="h-3.5 w-3.5" /> Forcer l&apos;enregistrement
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
