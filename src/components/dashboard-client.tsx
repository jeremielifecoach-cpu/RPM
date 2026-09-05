"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Star,
  Flame,
  Target,
  Inbox,
  Clock3,
  Check,
  Plus,
  ArrowRight,
  Zap,
  Trophy,
} from "lucide-react";
import { cn, api } from "@/lib/utils";
import type { Area } from "@/db/schema";
import type { BlockFull, DashboardStats } from "@/lib/types";
import { WheelOfLife } from "@/components/wheel-of-life";
import { AreaIcon } from "@/components/area-icon";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  sub: string;
  delay: string;
}) {
  return (
    <div
      className={cn(
        "rise rounded-2xl border border-white/[0.07] bg-[#101013]/80 p-4 backdrop-blur transition-colors duration-300 hover:border-amber-500/25",
        delay
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        <Icon className="h-3.5 w-3.5 text-amber-400" />
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-zinc-100">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>
    </div>
  );
}

export function DashboardClient({
  weekKey,
  weekLabel,
  todayLabel,
  areas,
  blocks,
  stats,
}: {
  weekKey: string;
  weekLabel: string;
  todayLabel: string;
  areas: Area[];
  blocks: BlockFull[];
  stats: DashboardStats;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [capture, setCapture] = useState("");
  const [saving, setSaving] = useState(false);
  const [captured, setCaptured] = useState(false);

  const musts = blocks
    .filter((b) => b.status === "active")
    .flatMap((b) =>
      b.actions
        .filter((a) => a.isMust && !a.isDone)
        .map((a) => ({ action: a, block: b }))
    );

  async function toggleAction(id: string, isDone: boolean) {
    await api(`/api/actions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isDone }),
    });
    startTransition(() => router.refresh());
  }

  async function quickCapture(e: React.FormEvent) {
    e.preventDefault();
    const content = capture.trim();
    if (!content) return;
    setSaving(true);
    await api("/api/captures", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    setCapture("");
    setSaving(false);
    setCaptured(true);
    setTimeout(() => setCaptured(false), 1800);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-8">
      {/* En-tête héro */}
      <section className="rise relative overflow-hidden rounded-3xl border border-white/[0.08]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: "url(/images/hero-energy.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070708] via-[#070708]/85 to-[#070708]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-transparent" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            {todayLabel} — {weekLabel}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.1] text-zinc-50 sm:text-5xl">
            Un <span className="italic text-amber-300">résultat</span> clair.
            Une <span className="italic text-amber-300">raison</span> qui brûle.
            Un plan d&apos;action <span className="italic text-amber-300">massif</span>.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            La méthode RPM n&apos;est pas une simple liste de tâches : c&apos;est un
            système de pensée. Capture, concentre, engage-toi — et reprends le
            contrôle du temps de ta vie.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/planifier"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2.5 text-sm font-bold text-black shadow-[0_8px_30px_rgba(245,185,60,0.25)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(245,185,60,0.45)]"
            >
              Planifier ma semaine
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/capture"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-zinc-200 backdrop-blur transition-colors duration-300 hover:border-amber-500/40 hover:text-amber-200"
            >
              <Inbox className="h-4 w-4" />
              Capture express
              {stats.inboxCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                  {stats.inboxCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Target}
          label="Blocs actifs"
          value={String(stats.activeBlocks)}
          sub={`${stats.totalBlocks} bloc${stats.totalBlocks > 1 ? "s" : ""} cette semaine`}
          delay="rise-1"
        />
        <StatCard
          icon={Star}
          label="MUST honnêt"
          value={`${stats.mustDone}/${stats.mustTotal}`}
          sub="engagements incontournables"
          delay="rise-2"
        />
        <StatCard
          icon={Flame}
          label="Élan de semaine"
          value={`${stats.weekProgress}%`}
          sub="actions du plan accomplies"
          delay="rise-3"
        />
        <StatCard
          icon={Clock3}
          label="Moments restants"
          value={`${Math.floor(stats.momentsTotal / 60)}h${String(
            stats.momentsTotal % 60
          ).padStart(2, "0")}`}
          sub="d'action massive devant toi"
          delay="rise-4"
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Colonne principale */}
        <div className="space-y-8 lg:col-span-7">
          {/* Les MUST de la semaine */}
          <section className="rise rise-2 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-zinc-100">
                Les <span className="italic text-amber-300">MUST</span> de ta semaine
              </h2>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Non négociable
              </span>
            </div>
            {musts.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
                <Trophy className="mx-auto h-8 w-8 text-amber-500/60" />
                <p className="mt-3 text-sm text-zinc-400">
                  Aucun MUST en attente. Soit tout est accompli — bravo — soit
                  il est temps de choisir ce qui compte vraiment.
                </p>
                <Link
                  href="/planifier"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300"
                >
                  Créer un plan d&apos;action massif
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {musts.map(({ action, block }) => (
                  <li
                    key={action.id}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:border-amber-500/25 hover:bg-amber-500/[0.04]"
                  >
                    <button
                      onClick={() => toggleAction(action.id, true)}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-zinc-600 transition-all duration-200 hover:border-amber-400 hover:bg-amber-400/10"
                      aria-label="Marquer comme accompli"
                    >
                      <Check className="h-4 w-4 text-transparent transition-colors hover:text-amber-300" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {action.content}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {block.result}
                      </p>
                    </div>
                    <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                    <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
                      {action.minutes}&apos;
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Blocs RPM de la semaine */}
          <section className="rise rise-3 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-zinc-100">
                Tes plans d&apos;action massif
              </h2>
              <Link
                href="/planifier"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400 hover:text-amber-300"
              >
                Tout voir
              </Link>
            </div>
            {blocks.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                Aucun bloc RPM cette semaine. La boucle RPM commence par la
                capture, puis le regroupement, puis tes blocs.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {blocks.slice(0, 4).map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/planifier/${b.id}`}
                      className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-amber-500/25 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-1 h-9 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: b.area?.color ?? "#52525b" }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-zinc-100 group-hover:text-amber-100">
                              {b.result}
                            </p>
                            {b.status === "victoire" && (
                              <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                            )}
                          </div>
                          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                              style={{ width: `${b.progress}%` }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-zinc-500">
                            {b.doneCount}/{b.totalCount} actions ·{" "}
                            {b.mustLeft} MUST restant{b.mustLeft > 1 ? "s" : ""}
                            {b.area ? ` · ${b.area.name}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 font-display text-lg font-bold text-amber-300">
                          {b.progress}%
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-8 lg:col-span-5">
          {/* Roue de vie */}
          <section className="rise rise-3 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-zinc-100">
                Roue de ta vie
              </h2>
              <Link
                href="/domaines"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400 hover:text-amber-300"
              >
                Évaluer
              </Link>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Ton niveau de satisfaction dans chaque domaine, sur 10.
            </p>
            <div className="mt-4 flex justify-center">
              <div className="max-w-full overflow-visible">
                <WheelOfLife areas={areas} size={300} />
              </div>
            </div>
          </section>

          {/* Capture express */}
          <section className="rise rise-4 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-[#0d0d10] to-[#0d0d10] p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-zinc-100">
              <Inbox className="h-5 w-5 text-amber-400" />
              Capture express
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
              Vide ton esprit. Tout ce qui te préoccupe doit sortir de ta tête
              pour entrer dans le système.
            </p>
            <form onSubmit={quickCapture} className="mt-4">
              <div className="flex gap-2">
                <input
                  value={capture}
                  onChange={(e) => setCapture(e.target.value)}
                  placeholder="Qu'est-ce qui tourne dans ta tête ?"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={saving || !capture.trim()}
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-200",
                    captured
                      ? "bg-emerald-500 text-black"
                      : "bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40"
                  )}
                  aria-label="Capturer"
                >
                  {captured ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Domaines résumé */}
          <section className="rise rise-5 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6">
            <h2 className="font-display text-lg font-bold text-zinc-100">
              Tes domaines en un regard
            </h2>
            <ul className="mt-4 space-y-2.5">
              {areas.map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.03]"
                    style={{ color: a.color }}
                  >
                    <AreaIcon icon={a.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="w-40 truncate text-xs font-medium text-zinc-300">
                    {a.name}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${a.score * 10}%`,
                        backgroundColor: a.color,
                      }}
                    />
                  </div>
                  <span className="w-9 text-right text-xs font-bold tabular-nums" style={{ color: a.color }}>
                    {a.score}/10
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <span className="hidden">{weekKey}</span>
    </div>
  );
}
