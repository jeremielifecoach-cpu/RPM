"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X, Target, Heart, Layers } from "lucide-react";
import { api } from "@/lib/utils";
import type { Area, Role } from "@/db/schema";

export function BlockForm({
  areas,
  roles,
  initial,
  weekStart,
  onClose,
  onSaved,
}: {
  areas: Area[];
  roles: Role[];
  initial?: { result?: string; purpose?: string; areaId?: string | null };
  weekStart: string;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const router = useRouter();
  const [result, setResult] = useState(initial?.result ?? "");
  const [purpose, setPurpose] = useState(initial?.purpose ?? "");
  const [areaId, setAreaId] = useState(initial?.areaId ?? areas[0]?.id ?? "");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [week, setWeek] = useState(weekStart);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!result.trim()) {
      setError("Le résultat est indispensable pour démarrer.");
      return;
    }
    setSaving(true);
    try {
      const row = await api<{ id: string }>("/api/blocks", {
        method: "POST",
        body: JSON.stringify({
          result: result.trim(),
          purpose,
          areaId: areaId || null,
          roleId: roleId || null,
          weekStart: week,
        }),
      });
      onSaved?.(row.id);
      router.refresh();
      onClose();
    } catch {
      setError("Impossible d'enregistrer. Réessaie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="rise w-full max-w-lg rounded-t-3xl border border-white/10 bg-[#0e0e11] p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Nouveau bloc RPM
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-zinc-50">
              Résultat · Pourquoi · Action
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-400 transition-colors hover:text-zinc-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-amber-500 text-[11px] font-black text-black">
                R
              </span>
              Le RÉSULTAT — que veux-tu exactement ?
            </label>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={2}
              placeholder="Précis, mesurable, enthousiasmant…"
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-amber-500/50"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-rose-300">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-rose-500 text-[11px] font-black text-black">
                P
              </span>
              Le POURQUOI — pourquoi est-ce un MUST ?
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              placeholder="Les raisons émotionnelles qui te mettront en mouvement…"
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-rose-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                <Layers className="h-3 w-3" /> Domaine
              </label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                <Heart className="h-3 w-3" /> Rôle (facultatif)
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
              >
                <option value="">Aucun</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
              <Target className="h-3 w-3" /> Semaine (lundi de début)
            </label>
            <input
              type="date"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-zinc-100 outline-none [color-scheme:dark] focus:border-amber-500/50"
            />
          </div>

          {error && <p className="text-sm font-medium text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 py-3 text-sm font-bold text-black shadow-[0_8px_30px_rgba(245,185,60,0.25)] transition-all hover:shadow-[0_8px_40px_rgba(245,185,60,0.4)] disabled:opacity-50"
          >
            {saving ? "Création…" : "Créer le bloc RPM"}
          </button>
          <p className="text-center text-xs text-zinc-600">
            Tu construiras ensuite ton plan d&apos;action massif dans le bloc.
          </p>
        </div>
      </form>
    </div>
  );
}
