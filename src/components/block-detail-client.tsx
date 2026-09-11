"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  Star,
  Check,
  Plus,
  Trash2,
  Trophy,
  Undo2,
  Flame,
} from "lucide-react";
import { cn, api } from "@/lib/utils";
import { weekRangeLabel } from "@/lib/date";
import type { Area, Role } from "@/db/schema";
import type { BlockFull } from "@/lib/types";
import { AreaIcon } from "@/components/area-icon";

function ProgressRing({ value, size = 120 }: { value: number; size?: number }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#2b2b30"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        className="transition-all duration-700 ease-out"
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5b93c" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        className="font-display"
        fill="#fcedd0"
        fontSize={size * 0.24}
        fontWeight={800}
      >
        {value}%
      </text>
    </svg>
  );
}

export function BlockDetailClient({
  block,
  areas,
  roles,
}: {
  block: BlockFull;
  areas: Area[];
  roles: Role[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [result, setResult] = useState(block.result);
  const [purpose, setPurpose] = useState(block.purpose);
  const [newAction, setNewAction] = useState("");
  const [newMust, setNewMust] = useState(false);
  const [newMinutes, setNewMinutes] = useState(15);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function patchBlock(body: Record<string, unknown>) {
    await api(`/api/blocks/${block.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    refresh();
  }

  async function addAction(e: React.FormEvent) {
    e.preventDefault();
    const content = newAction.trim();
    if (!content) return;
    setNewAction("");
    await api("/api/actions", {
      method: "POST",
      body: JSON.stringify({
        blockId: block.id,
        content,
        isMust: newMust,
        minutes: newMinutes,
      }),
    });
    setNewMust(false);
    refresh();
  }

  async function patchAction(id: string, body: Record<string, unknown>) {
    await api(`/api/actions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    refresh();
  }

  async function removeAction(id: string) {
    await api(`/api/actions/${id}`, { method: "DELETE" });
    refresh();
  }

  async function removeBlock() {
    await api(`/api/blocks/${block.id}`, { method: "DELETE" });
    router.push("/planifier");
    router.refresh();
  }

  const musts = block.actions.filter((a) => a.isMust);
  const optionals = block.actions.filter((a) => !a.isMust);
  const isVictory = block.status === "victoire";
  const totalMinutes = block.actions.reduce((s, a) => s + (a.minutes || 0), 0);

  return (
    <div className="space-y-7">
      {/* Navigation */}
      <div className="rise flex items-center justify-between">
        <Link
          href={`/planifier?semaine=${block.weekStart}`}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à la semaine
        </Link>
        <div className="flex items-center gap-2">
          {isVictory ? (
            <button
              onClick={() => patchBlock({ status: "active" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Réactiver
            </button>
          ) : (
            <button
              onClick={() => patchBlock({ status: "victoire" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/10"
            >
              <Trophy className="h-3.5 w-3.5" />
              Célébrer la victoire
            </button>
          )}
          {confirmingDelete ? (
            <span className="flex items-center gap-1.5">
              <button
                onClick={removeBlock}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white"
              >
                Confirmer
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-400"
              >
                Annuler
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-500 transition-colors hover:border-rose-500/50 hover:text-rose-400"
              title="Supprimer ce bloc"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bandeau méta */}
      <div className="rise rise-1 grid gap-6 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6 lg:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
              {weekRangeLabel(block.weekStart)}
              {isVictory && (
                <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                  VICTOIRE
                </span>
              )}
            </p>
            {/* R — Résultat */}
            <div className="mt-3 flex items-start gap-3">
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 font-display text-lg font-black text-black shadow-[0_4px_20px_rgba(245,185,60,0.3)]">
                R
              </span>
              <div className="min-w-0 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                  Le résultat — ta destination
                </label>
                <textarea
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  onBlur={() =>
                    result.trim() && result.trim() !== block.result
                      ? patchBlock({ result })
                      : setResult(block.result)
                  }
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border border-transparent bg-transparent px-2 py-1 font-display text-2xl font-bold leading-snug text-zinc-50 outline-none transition-colors placeholder-zinc-700 focus:border-amber-500/40 focus:bg-black/30"
                  placeholder="Un résultat précis et mesurable"
                />
              </div>
            </div>
          </div>

          {/* P — Pourquoi */}
          <div className="flex items-start gap-3">
            <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 font-display text-lg font-black text-black shadow-[0_4px_20px_rgba(244,63,94,0.25)]">
              P
            </span>
            <div className="min-w-0 flex-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">
                Les raisons — ton moteur émotionnel
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                onBlur={() =>
                  purpose !== block.purpose ? patchBlock({ purpose }) : null
                }
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-transparent bg-transparent px-2 py-1 text-sm italic leading-relaxed text-zinc-300 outline-none transition-colors placeholder-zinc-700 focus:border-rose-500/40 focus:bg-black/30"
                placeholder="Pourquoi est-ce un MUST dans ta vie ? Que ressentiras-tu en atteignant ce résultat ? Que t'en coûtera-t-il de ne pas le faire ?"
              />
            </div>
          </div>

          {/* Méta : domaine + rôle */}
          <div className="flex flex-wrap items-center gap-3 pl-[52px]">
            <select
              value={block.areaId ?? ""}
              onChange={(e) =>
                patchBlock({ areaId: e.target.value || null })
              }
              className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 outline-none focus:border-amber-500/50"
            >
              <option value="">Sans domaine</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select
              value={block.roleId ?? ""}
              onChange={(e) => patchBlock({ roleId: e.target.value || null })}
              className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 outline-none focus:border-amber-500/50"
            >
              <option value="">Sans rôle</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {block.area && (
              <span
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: `${block.area.color}1e`,
                  color: block.area.color,
                }}
              >
                <AreaIcon icon={block.area.icon} className="h-3 w-3" />
                {block.area.name}
              </span>
            )}
          </div>
        </div>

        {/* Progression */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-black/30 p-6">
          <ProgressRing value={block.progress} />
          <p className="text-xs font-semibold text-zinc-400">
            {block.doneCount}/{block.totalCount} actions
          </p>
          <p className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Flame className="h-3 w-3 text-amber-400" />
            {Math.floor(totalMinutes / 60)}h{String(totalMinutes % 60).padStart(2, "0")} de moments
          </p>
        </div>
      </div>

      {/* M — Plan d'action massif */}
      <section className="rise rise-2 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 font-display text-lg font-black text-black shadow-[0_4px_20px_rgba(56,189,248,0.25)]">
            M
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-zinc-100">
              Plan d&apos;action massif
            </h2>
            <p className="text-xs text-zinc-500">
              Fais d&apos;abord vomir tout ce qui te vient à l&apos;esprit, puis
              distingue tes <span className="font-bold text-amber-300">MUST</span>{" "}
              (non négociables) du reste (ce serait bien).
            </p>
          </div>
        </div>

        {/* Liste MUST */}
        <h3 className="mt-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-amber-300">
          <Star className="h-3.5 w-3.5 fill-amber-300" />
          Tes MUST — les 80/20 qui créent le résultat
        </h3>
        <ul className="mt-3 space-y-2">
          {musts.length === 0 && (
            <li className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-zinc-500">
              Aucun MUST identifié. Parmi tes actions, lesquelles sont
              absolument indispensables au résultat ?
            </li>
          )}
          {musts.map((a) => (
            <ActionRow
              key={a.id}
              action={a}
              onToggle={(id, v) => patchAction(id, { isDone: v })}
              onStar={(id, v) => patchAction(id, { isMust: v })}
              onMinutes={(id, v) => patchAction(id, { minutes: v })}
              onRemove={removeAction}
            />
          ))}
        </ul>

        {/* Liste optionnelle */}
        {optionals.length > 0 && (
          <>
            <h3 className="mt-7 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">
              Ce serait bien — si le temps le permet
            </h3>
            <ul className="mt-3 space-y-2">
              {optionals.map((a) => (
                <ActionRow
                  key={a.id}
                  action={a}
                  onToggle={(id, v) => patchAction(id, { isDone: v })}
                  onStar={(id, v) => patchAction(id, { isMust: v })}
                  onMinutes={(id, v) => patchAction(id, { minutes: v })}
                  onRemove={removeAction}
                />
              ))}
            </ul>
          </>
        )}

        {/* Ajout d'action */}
        <form
          onSubmit={addAction}
          className="mt-6 rounded-2xl border border-white/[0.08] bg-black/30 p-3"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Nouvelle action massive…"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-sky-500/50"
            />
            <button
              type="button"
              onClick={() => setNewMust((v) => !v)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-all",
                newMust
                  ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
                  : "border-white/10 text-zinc-500 hover:text-zinc-300"
              )}
              title="MUST si indispensable au résultat"
            >
              <Star
                className={cn("h-3.5 w-3.5", newMust && "fill-amber-300")}
              />
              MUST
            </button>
            <div className="flex items-center gap-1">
              {[10, 15, 20, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setNewMinutes(m)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-[11px] font-bold transition-all",
                    newMinutes === m
                      ? "bg-sky-500/20 text-sky-300"
                      : "text-zinc-600 hover:text-zinc-300"
                  )}
                >
                  {m}&apos;
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={!newAction.trim()}
              className="grid h-9 w-9 place-items-center rounded-lg bg-sky-500 text-black transition-all hover:bg-sky-400 disabled:opacity-40"
              aria-label="Ajouter l'action"
            >
              <Plus className="h-4 w-4" strokeWidth={2.6} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ActionRow({
  action,
  onToggle,
  onStar,
  onMinutes,
  onRemove,
}: {
  action: BlockFull["actions"][number];
  onToggle: (id: string, v: boolean) => void;
  onStar: (id: string, v: boolean) => void;
  onMinutes: (id: string, v: number) => void;
  onRemove: (id: string) => void;
}) {
  const minutes = action.minutes || 0;

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-200",
        action.isDone
          ? "border-white/[0.04] bg-white/[0.01] opacity-60"
          : action.isMust
          ? "border-amber-500/20 bg-amber-500/[0.05] hover:border-amber-500/40"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
      )}
    >
      <button
        onClick={() => onToggle(action.id, !action.isDone)}
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-all duration-200",
          action.isDone
            ? "border-emerald-500 bg-emerald-500"
            : "border-zinc-600 hover:border-emerald-400"
        )}
        aria-label={action.isDone ? "Marquer à faire" : "Marquer accompli"}
      >
        {action.isDone && <Check className="h-4 w-4 text-black" strokeWidth={3} />}
      </button>
      <p
        className={cn(
          "min-w-0 flex-1 text-sm leading-relaxed",
          action.isDone
            ? "text-zinc-600 line-through decoration-zinc-700"
            : "text-zinc-100"
        )}
      >
        {action.content}
      </p>
      <button
        onClick={() => onMinutes(action.id, minutes + 5 > 90 ? 10 : minutes + 5)}
        title="Durée estimée (cliquer pour augmenter)"
        className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-zinc-400 transition-colors hover:text-zinc-200"
      >
        {minutes}&apos;
      </button>
      <button
        onClick={() => onStar(action.id, !action.isMust)}
        title={action.isMust ? "Rétrograder en « ce serait bien »" : "Élever en MUST"}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/[0.06]"
      >
        <Star
          className={cn(
            "h-4 w-4 transition-colors",
            action.isMust
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-600 group-hover:text-zinc-400"
          )}
        />
      </button>
      <button
        onClick={() => onRemove(action.id)}
        title="Supprimer l'action"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-zinc-600 opacity-100 transition-colors hover:text-rose-400 lg:opacity-0 lg:group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
