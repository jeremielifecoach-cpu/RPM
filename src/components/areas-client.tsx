"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api, cn } from "@/lib/utils";
import type { Area } from "@/db/schema";
import { WheelOfLife } from "@/components/wheel-of-life";
import { AreaIcon } from "@/components/area-icon";

const VERDICTS: [number, string][] = [
  [9, "Maîtrise — tu rayonnes dans ce domaine."],
  [7, "Solide — une base à faire briller encore plus."],
  [5, "Zone de bascule — choisis de la faire monter."],
  [3, "Signal d'alarme — ce domaine appelle ton attention."],
  [0, "Urgence vitale — commence par là, une action aujourd'hui."],
];

function verdict(score: number) {
  for (const [min, text] of VERDICTS) if (score >= min) return text;
  return "";
}

export function AreasClient({ areas }: { areas: Area[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<Area | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [liveScores, setLiveScores] = useState<Record<string, number>>({});

  const scoreOf = (a: Area) => liveScores[a.id] ?? a.score;

  function refresh() {
    startTransition(() => router.refresh());
  }

  function moveSlider(a: Area, score: number) {
    setLiveScores((s) => ({ ...s, [a.id]: score }));
  }

  async function commitScore(a: Area, score: number) {
    if (score === a.score) return;
    await api(`/api/areas/${a.id}`, {
      method: "PATCH",
      body: JSON.stringify({ score }),
    });
    refresh();
  }

  async function setFocus(a: Area, focus: string) {
    await api(`/api/areas/${a.id}`, {
      method: "PATCH",
      body: JSON.stringify({ focus }),
    });
    refresh();
  }

  async function addArea(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setNewName("");
    setAdding(false);
    await api("/api/areas", {
      method: "POST",
      body: JSON.stringify({ name, icon: "star", color: "#F5B93C" }),
    });
    refresh();
  }

  async function removeArea(id: string) {
    if (areas.length <= 2) return;
    await api(`/api/areas/${id}`, { method: "DELETE" });
    setSelected(null);
    refresh();
  }

  const avg =
    areas.length === 0
      ? 0
      : Math.round((areas.reduce((s, a) => s + a.score, 0) / areas.length) * 10) / 10;

  return (
    <div className="space-y-8">
      <header className="rise">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
          Où en est ta vie maintenant ?
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-zinc-50">
          Tes <span className="italic text-amber-300">domaines de vie</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          La méthode RPM commence par un état des lieux honnête. Note chaque
          domaine de 0 à 10 selon ton niveau de satisfaction — pas ton niveau
          d&apos;activité. Une roue voilée ne roule pas droit ; repère les
          spicules qui demandent ton énergie cette semaine.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Roue */}
        <section className="rise rise-1 flex flex-col items-center rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6 lg:col-span-5">
          <div className="flex w-full items-center justify-between">
            <h2 className="font-display text-lg font-bold text-zinc-100">
              Ta roue d&apos;équilibre
            </h2>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-amber-300">
                {avg}
                <span className="text-sm text-zinc-500">/10</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Moyenne globale
              </p>
            </div>
          </div>
          <div className="mt-4">
            <WheelOfLife
              areas={areas}
              size={320}
              interactive
              onSelect={(a) => setSelected(a)}
            />
          </div>
          <p className="mt-2 text-center text-xs text-zinc-600">
            Clique sur un point pour écrire ton intention dans ce domaine.
          </p>
        </section>

        {/* Jauges */}
        <section className="rise rise-2 lg:col-span-7">
          <div className="grid gap-3 sm:grid-cols-2">
            {areas.map((a, i) => (
              <article
                key={a.id}
                className={cn(
                  "group relative rounded-2xl border p-4 transition-all duration-300",
                  selected?.id === a.id
                    ? "border-amber-500/40 bg-amber-500/[0.06]"
                    : "border-white/[0.07] bg-[#0d0d10]/70 hover:border-white/[0.16]",
                  i % 2 === 0 ? "rise rise-2" : "rise rise-3"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06]"
                      style={{ backgroundColor: `${a.color}18`, color: a.color }}
                    >
                      <AreaIcon icon={a.icon} className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-bold text-zinc-100">{a.name}</h3>
                  </div>
                  <p
                    className="font-display text-xl font-black tabular-nums"
                    style={{ color: a.color }}
                  >
                    {scoreOf(a)}
                  </p>
                </div>

                <div className="mt-3">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={scoreOf(a)}
                    onChange={(e) => moveSlider(a, Number(e.target.value))}
                    onPointerUp={() => commitScore(a, scoreOf(a))}
                    onKeyUp={() => commitScore(a, scoreOf(a))}
                    className="gauge"
                    style={{
                      ["--gauge-color" as string]: a.color,
                      background: `linear-gradient(90deg, ${a.color} ${
                        scoreOf(a) * 10
                      }%, rgba(255,255,255,0.08) ${scoreOf(a) * 10}%)`,
                    }}
                    aria-label={`Niveau de satisfaction — ${a.name}`}
                  />
                  <p className="mt-1.5 text-[11px] leading-snug text-zinc-500">
                    {verdict(scoreOf(a))}
                  </p>
                </div>

                <textarea
                  defaultValue={a.focus}
                  key={`${a.id}-focus`}
                  onBlur={(e) => {
                    if (e.target.value !== a.focus) setFocus(a, e.target.value);
                  }}
                  rows={1}
                  placeholder="Ton intention dans ce domaine…"
                  className="mt-2 w-full resize-none rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-xs italic text-zinc-300 placeholder-zinc-700 outline-none transition-colors focus:border-white/20 focus:bg-black/30"
                />

                {areas.length > 2 && (
                  <button
                    onClick={() => removeArea(a.id)}
                    title="Retirer ce domaine"
                    className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-md text-zinc-700 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </article>
            ))}

            {/* Ajouter un domaine */}
            {adding ? (
              <form
                onSubmit={addArea}
                className="flex items-center gap-2 rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-4"
              >
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom du domaine…"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-black"
                >
                  Ajouter
                </button>
              </form>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex min-h-28 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 p-4 text-sm font-semibold text-zinc-500 transition-all hover:border-amber-500/30 hover:text-amber-300"
              >
                <Plus className="h-4 w-4" />
                Ajouter un domaine
              </button>
            )}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-600">
            La question n&apos;est pas « comment arriver à tout faire ? » mais
            « quel niveau de vie je choisis dans chaque domaine ? ». Un 6 dans
            un domaine crucial mérite un bloc RPM cette semaine.
          </p>
        </section>
      </div>
    </div>
  );
}
