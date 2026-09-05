"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  HeartHandshake,
  Trophy,
  BookOpen,
  Trash2,
  PenLine,
} from "lucide-react";
import { cn, api } from "@/lib/utils";
import { fullDateFr, todayISO } from "@/lib/date";
import type { JournalEntry } from "@/db/schema";

type EntryType = "gratitude" | "victoire" | "reflexion";

const TYPES: Record<
  EntryType,
  {
    label: string;
    color: string;
    icon: typeof HeartHandshake;
    hint: string;
    placeholder: string;
  }
> = {
  gratitude: {
    label: "Gratitude",
    color: "#F5B93C",
    icon: HeartHandshake,
    hint: "3 moments ou personnes pour lesquels ton cœur se dilate.",
    placeholder: "Je suis reconnaissant pour…",
  },
  victoire: {
    label: "Victoire",
    color: "#34D399",
    icon: Trophy,
    hint: "Grande ou minuscule, chaque victoire mérite célébration.",
    placeholder: "Aujourd'hui, j'ai accompli…",
  },
  reflexion: {
    label: "Réflexion",
    color: "#38BDF8",
    icon: BookOpen,
    hint: "Leçons, émotions, observations — clarifie ton esprit.",
    placeholder: "Ce que ce jour m'a appris…",
  },
};

export function JournalClient({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [type, setType] = useState<EntryType>("gratitude");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<EntryType | "tout">("tout");

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setContent("");
    await api("/api/journal", {
      method: "POST",
      body: JSON.stringify({ type, content: text, date: todayISO() }),
    });
    refresh();
  }

  async function remove(id: string) {
    await api(`/api/journal/${id}`, { method: "DELETE" });
    refresh();
  }

  const grouped = useMemo(() => {
    const list = filter === "tout" ? entries : entries.filter((e) => e.type === filter);
    const map = new Map<string, JournalEntry[]>();
    for (const e of list) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [entries, filter]);

  const t = TYPES[type];

  return (
    <div className="space-y-8">
      <header className="rise">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
          Le rituel du matin — l&apos;amorçage
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-zinc-50">
          Journal <span className="italic text-amber-300">quotidien</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Tony Robbins commence chaque journée par son « priming » : gratitude,
          célébration, focalisation. Note ici tes gratitudes, victoires et
          réflexions — et regarde ton état émotionnel se transformer.
        </p>
      </header>

      {/* Formulaire */}
      <section className="rise rise-1 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPES) as EntryType[]).map((k) => {
            const tt = TYPES[k];
            const active = type === k;
            return (
              <button
                key={k}
                onClick={() => setType(k)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all",
                  active
                    ? "border-transparent text-black"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                )}
                style={active ? { backgroundColor: tt.color } : undefined}
              >
                <tt.icon className="h-4 w-4" />
                {tt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs italic text-zinc-500">{t.hint}</p>
        <form onSubmit={add} className="mt-3 flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-amber-500/50"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl text-black transition-all disabled:opacity-40"
            style={{ backgroundColor: t.color }}
            aria-label="Noter dans le journal"
          >
            <PenLine className="h-5 w-5" />
          </button>
        </form>
      </section>

      {/* Filtres */}
      <div className="rise rise-2 flex flex-wrap items-center gap-2">
        {(["tout", "gratitude", "victoire", "reflexion"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
              filter === k
                ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                : "border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-300"
            )}
          >
            {k === "tout" ? "Tout" : TYPES[k].label}
          </button>
        ))}
      </div>

      {/* Chronologie */}
      {grouped.length === 0 ? (
        <div className="rise rise-3 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
          <HeartHandshake className="mx-auto h-8 w-8 text-amber-500/50" />
          <p className="mt-3 font-display text-lg italic text-zinc-300">
            « Si tu n&apos;as que deux minutes, donne-les à la gratitude. »
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Écris ta première pensée positive ci-dessus.
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          {grouped.map(([date, list]) => (
            <section key={date} className="rise rise-3">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-bold text-zinc-100">
                  {date === todayISO() ? "Aujourd'hui" : fullDateFr(date)}
                </h2>
                <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <ul className="mt-3 space-y-2">
                {list.map((e) => {
                  const tt = TYPES[e.type as EntryType] ?? TYPES.gratitude;
                  return (
                    <li
                      key={e.id}
                      className="group flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#0d0d10]/70 px-4 py-3 transition-colors hover:border-white/[0.14]"
                    >
                      <span
                        className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                        style={{ backgroundColor: `${tt.color}18`, color: tt.color }}
                      >
                        <tt.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[10px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: tt.color }}
                        >
                          {tt.label}
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-zinc-200">
                          {e.content}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(e.id)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-zinc-700 opacity-100 transition-colors hover:text-rose-400 lg:opacity-0 lg:group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
