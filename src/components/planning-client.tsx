"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Trophy,
  Star,
  ArrowRight,
  Target,
  Heart,
  Layers,
  Undo2,
} from "lucide-react";
import { cn, api } from "@/lib/utils";
import { addWeeks, isCurrentWeek, shortMonthDay, weekRangeLabel } from "@/lib/date";
import type { Area, Role } from "@/db/schema";
import type { BlockFull } from "@/lib/types";
import { AreaIcon } from "@/components/area-icon";
import { BlockForm } from "@/components/block-form";

export function PlanningClient({
  areas,
  roles,
  blocks,
  weekKey,
}: {
  areas: Area[];
  roles: Role[];
  blocks: BlockFull[];
  weekKey: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);

  const active = blocks.filter((b) => b.status === "active");
  const victories = blocks.filter((b) => b.status === "victoire");
  const current = isCurrentWeek(weekKey);

  function navigate(delta: number) {
    const target = addWeeks(weekKey, delta);
    startTransition(() =>
      router.push(`/planifier?semaine=${target}`)
    );
  }

  function goCurrent() {
    startTransition(() => router.push("/planifier"));
  }

  async function setStatus(id: string, status: string) {
    await api(`/api/blocks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-8">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
            Étape 3 · Plan d&apos;Action Massif
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-zinc-50">
            Planification <span className="italic text-amber-300">RPM</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            R comme <strong className="text-amber-200">Résultat</strong> — une
            destination précise. P comme <strong className="text-rose-200">Pourquoi</strong>{" "}
            — ton moteur émotionnel. M comme{" "}
            <strong className="text-sky-200">Massif</strong> — ton plan d&apos;action.
            Ne gère pas ton temps : gère ta vie.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2.5 text-sm font-bold text-black shadow-[0_8px_30px_rgba(245,185,60,0.25)] transition-all hover:shadow-[0_8px_40px_rgba(245,185,60,0.45)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.6} />
          Nouveau bloc RPM
        </button>
      </header>

      {/* Navigation des semaines */}
      <div className="rise rise-1 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0d0d10]/80 p-3">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Semaine précédente
        </button>
        <button
          onClick={goCurrent}
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-center transition-colors hover:bg-white/[0.04]"
          title="Revenir à la semaine actuelle"
        >
          <CalendarDays className="h-4 w-4 text-amber-400" />
          <span className="font-display text-base font-bold text-zinc-100">
            {weekRangeLabel(weekKey)}
          </span>
          {current && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              En cours
            </span>
          )}
        </button>
        <button
          onClick={() => navigate(1)}
          className="group flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
        >
          Semaine suivante
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Blocs actifs */}
      {active.length === 0 && victories.length === 0 ? (
        <div className="rise rise-2 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
          <Target className="mx-auto h-10 w-10 text-amber-500/50" />
          <p className="mt-4 font-display text-xl italic text-zinc-200">
            « La clarté est le pouvoir. »
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Cette semaine n&apos;a pas encore de bloc RPM. Choisis les quelques
            résultats qui rendraient ta semaine extraordinaire — pas 47, les
            vrais.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            Créer mon premier bloc
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {active.map((b, i) => (
            <article
              key={b.id}
              className={cn(
                "rise group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-5 transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_12px_50px_rgba(0,0,0,0.5)]",
                i === 1 && "rise-1",
                i === 2 && "rise-2",
                i === 3 && "rise-3"
              )}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${b.area?.color ?? "#71717a"}, transparent)`,
                }}
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Lettre R */}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-display text-sm font-black text-black">
                    R
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {b.area && (
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${b.area.color}22`,
                          color: b.area.color,
                        }}
                      >
                        <AreaIcon icon={b.area.icon} className="h-3 w-3" />
                        {b.area.name}
                      </span>
                    )}
                    {b.role && (
                      <span className="flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        <Heart className="h-3 w-3" />
                        {b.role.name}
                      </span>
                    )}
                  </div>
                </div>
                <p className="shrink-0 font-display text-xl font-bold text-amber-300">
                  {b.progress}%
                </p>
              </div>

              <Link href={`/planifier/${b.id}`} className="group/title">
                <h2 className="mt-3 font-display text-lg font-bold leading-snug text-zinc-50 transition-colors group-hover/title:text-amber-200">
                  {b.result}
                </h2>
              </Link>
              {b.purpose && (
                <p className="mt-1.5 line-clamp-2 text-xs italic leading-relaxed text-zinc-500">
                  « {b.purpose} »
                </p>
              )}

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                  style={{ width: `${b.progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-zinc-500">
                <span>
                  {b.doneCount}/{b.totalCount} actions accomplies
                </span>
                {b.mustLeft > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {b.mustLeft} MUST
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                <Link
                  href={`/planifier/${b.id}`}
                  className="group/link inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors hover:bg-amber-500/15 hover:text-amber-300"
                >
                  Ouvrir le plan
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
                <button
                  onClick={() => setStatus(b.id, "victoire")}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/10"
                  title="Résultat atteint — célébrer la victoire"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Victoire
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Victoires */}
      {victories.length > 0 && (
        <section className="rise rise-3">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-zinc-100">
            <Trophy className="h-5 w-5 text-amber-400" />
            Victoires de la semaine
          </h2>
          <div className="mt-3 space-y-2">
            {victories.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3"
              >
                <Trophy className="h-4 w-4 shrink-0 text-emerald-400" />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">
                  {b.result}
                </p>
                <span className="hidden text-xs text-zinc-500 sm:block">
                  {shortMonthDay(b.weekStart)}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {b.doneCount}/{b.totalCount} actions
                </span>
                <button
                  onClick={() => setStatus(b.id, "active")}
                  title="Réactiver"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-zinc-500 transition-colors hover:text-amber-300"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <Link
                  href={`/planifier/${b.id}`}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-zinc-500 transition-colors hover:text-zinc-100"
                >
                  <Layers className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {creating && (
        <BlockForm
          areas={areas}
          roles={roles}
          weekStart={weekKey}
          onClose={() => setCreating(false)}
        />
      )}

      {/* Rappel méthode */}
      <section className="rise rise-4 grid gap-3 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/60 p-6 sm:grid-cols-3">
        {[
          {
            l: "R",
            t: "Résultat",
            d: "Ce que tu veux obtenir — précis, mesurable, formulé positivement.",
            c: "from-amber-400 to-amber-600",
          },
          {
            l: "P",
            t: "Pourquoi",
            d: "Les raisons émotionnelles. Sans pourquoi puissant, une liste reste une liste.",
            c: "from-rose-400 to-rose-600",
          },
          {
            l: "M",
            t: "Plan massif",
            d: "Toutes les actions imaginables, triées en MUST et en « ce serait bien ».",
            c: "from-sky-400 to-sky-600",
          },
        ].map((x) => (
          <div key={x.l} className="flex gap-3">
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br font-display text-lg font-black text-black",
                x.c
              )}
            >
              {x.l}
            </span>
            <div>
              <p className="text-sm font-bold text-zinc-100">{x.t}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{x.d}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
