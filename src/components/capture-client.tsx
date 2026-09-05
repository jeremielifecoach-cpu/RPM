"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  Inbox,
  Check,
  Trash2,
  RotateCcw,
  CornerDownRight,
  Sparkles,
  Radar,
} from "lucide-react";
import { cn, api } from "@/lib/utils";
import type { Area, Role } from "@/db/schema";
import type { CaptureWithArea } from "@/lib/types";
import { AreaIcon } from "@/components/area-icon";
import { BlockForm } from "@/components/block-form";

export function CaptureClient({
  areas,
  roles,
  captures,
  weekKey,
}: {
  areas: Area[];
  roles: Role[];
  captures: CaptureWithArea[];
  weekKey: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"inbox" | "processed">("inbox");
  const [chunking, setChunking] = useState<CaptureWithArea | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const inbox = captures.filter((c) => c.status === "inbox");
  const processed = captures.filter((c) => c.status === "processed");
  const shown = tab === "inbox" ? inbox : processed;

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function add(e?: React.FormEvent) {
    e?.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText("");
    await api("/api/captures", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    refresh();
    inputRef.current?.focus();
  }

  async function setStatus(id: string, status: string) {
    await api(`/api/captures/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    refresh();
  }

  async function setArea(id: string, areaId: string) {
    await api(`/api/captures/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ areaId: areaId || null }),
    });
    refresh();
  }

  async function remove(id: string) {
    await api(`/api/captures/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-8">
      <header className="rise">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
          Étape 1 · Vider ton esprit
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-zinc-50">
          Capture <span className="italic text-amber-300">totale</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Tony Robbins le dit : « ce qui t&apos;empêche de dormir, ce n&apos;est pas
          ton cerveau qui te réveille, c&apos;est ce qu&apos;il retient pour toi ».
          Sors tout de ta tête — idées, inquiétudes, courses, rêves — puis
          regroupe (« chunking ») et transforme l&apos;essentiel en blocs RPM.
        </p>
      </header>

      {/* Saisie rapide */}
      <form onSubmit={add} className="rise rise-1">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10]/80 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 px-5 py-4">
            <Radar className="h-5 w-5 shrink-0 text-amber-400" />
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Une pensée, une idée, une obligation… Écris et appuie sur Entrée."
              className="min-w-0 flex-1 bg-transparent text-base text-zinc-100 placeholder-zinc-600 outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black transition-all hover:bg-amber-400 disabled:opacity-40"
            >
              Capturer
            </button>
          </div>
        </div>
        <p className="mt-2 pl-1 text-xs text-zinc-600">
          Astuce : ne juge pas, ne trie pas. Capture d&apos;abord, organise ensuite.
        </p>
      </form>

      {/* Onglets */}
      <div className="rise rise-2 flex items-center gap-2">
        {(
          [
            ["inbox", `Boîte de réception · ${inbox.length}`],
            ["processed", `Traitées · ${processed.length}`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
              tab === key
                ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                : "border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {shown.length === 0 ? (
        <div className="rise rise-3 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-amber-500/50" />
          <p className="mt-3 font-display text-lg italic text-zinc-300">
            {tab === "inbox"
              ? "Un esprit clair est un esprit libre."
              : "Rien de traité pour l'instant."}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {tab === "inbox"
              ? "Ta boîte de capture est vide. Capture tout ce qui occupe ton mental."
              : "Les éléments traités apparaîtront ici."}
          </p>
        </div>
      ) : (
        <ul className="rise rise-3 space-y-2.5">
          {shown.map((c) => (
            <li
              key={c.id}
              className="group rounded-2xl border border-white/[0.07] bg-[#0d0d10]/70 p-4 transition-all duration-200 hover:border-white/15"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.04]">
                  <Inbox className="h-3.5 w-3.5 text-zinc-500" />
                </span>
                <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-zinc-100">
                  {c.content}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {tab === "inbox" ? (
                    <>
                      <button
                        onClick={() => setChunking(c)}
                        title="Transformer en bloc RPM (chunking)"
                        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 transition-all hover:bg-amber-500/20"
                      >
                        Chunker
                      </button>
                      <button
                        onClick={() => setStatus(c.id, "processed")}
                        title="Marquer comme traité"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setStatus(c.id, "inbox")}
                      title="Remettre dans la boîte"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-amber-500/50 hover:text-amber-300"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => remove(c.id)}
                    title="Supprimer"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-400 opacity-100 transition-colors hover:border-rose-500/50 hover:text-rose-400 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Assignation de domaine */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-10">
                <CornerDownRight className="h-3.5 w-3.5 text-zinc-600" />
                <button
                  onClick={() => setArea(c.id, "")}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all",
                    !c.areaId
                      ? "border-zinc-400/50 bg-white/10 text-zinc-200"
                      : "border-white/10 text-zinc-600 hover:border-white/25 hover:text-zinc-300"
                  )}
                >
                  Sans domaine
                </button>
                {areas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setArea(c.id, c.areaId === a.id ? "" : a.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all",
                      c.areaId === a.id
                        ? "border-transparent text-black"
                        : "border-white/10 text-zinc-500 hover:text-zinc-200"
                    )}
                    style={
                      c.areaId === a.id ? { backgroundColor: a.color } : undefined
                    }
                  >
                    <AreaIcon
                      icon={a.icon}
                      className="h-3 w-3"
                      strokeWidth={2.4}
                    />
                    {a.name}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {chunking && (
        <BlockForm
          areas={areas}
          roles={roles}
          weekStart={weekKey}
          initial={{ result: chunking.content, areaId: chunking.areaId }}
          onClose={() => setChunking(null)}
          onSaved={async () => {
            await setStatus(chunking.id, "processed");
          }}
        />
      )}
    </div>
  );
}
