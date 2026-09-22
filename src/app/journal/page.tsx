"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, Trash2, Calendar, Sparkles, Trophy, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

interface JournalEntry {
  id: string;
  content?: string;
  text?: string;
  description?: string;
  createdAt?: string;
  date?: string;
}

function RenderJournalContent({ raw }: { raw: string }) {
  if (!raw) return null;

  let parsed: any = null;
  if (typeof raw === "string" && raw.trim().startsWith("{")) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  if (!parsed) {
    return (
      <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
        {raw}
      </p>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      {parsed.scoreDay !== undefined && parsed.scoreDay !== null && (
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          ⭐ Score de la journée : {parsed.scoreDay}/10
        </div>
      )}

      {Array.isArray(parsed.gratitudes) && parsed.gratitudes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Gratitudes & Moments de Joie
          </h4>
          <ul className="space-y-1.5">
            {parsed.gratitudes.map((g: string, idx: number) => (
              <li key={idx} className="text-xs text-zinc-200 flex items-start gap-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-amber-400 font-bold">•</span>
                <span className="leading-relaxed">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsed.victories && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" /> Victoires du Jour
          </h4>
          <p className="text-xs text-zinc-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
            {parsed.victories}
          </p>
        </div>
      )}

      {parsed.reflections && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" /> Réflexions & Apprentissages
          </h4>
          <p className="text-xs text-zinc-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
            {parsed.reflections}
          </p>
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const res = await fetch("/api/journal", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        data.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date || 0).getTime();
          const dateB = new Date(b.createdAt || b.date || 0).getTime();
          return dateB - dateA;
        });
        setEntries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        loadEntries();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Es-tu sûr de vouloir supprimer cet enregistrement ?")) return;
    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Chargement du journal...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-amber-400" />
          Journal <span className="italic text-amber-300">Quotidien</span>
        </h1>
      </div>

      <form onSubmit={handleAdd} className="space-y-4 rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-xl">
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Qu'as-tu accompli aujourd'hui ? Quelles sont tes réflexions ?"
          className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-100 outline-none resize-y"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Ajouter au journal
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase">Tes précédents enregistrements ({entries.length})</h2>

        {entries.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">Ton journal est vide pour le moment.</p>
        ) : (
          entries.map((entry) => {
            const dateObj = new Date(entry.createdAt || entry.date || Date.now());
            const dateStr = dateObj.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const timeStr = dateObj.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const rawText = entry.content || entry.text || entry.description || "";

            return (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-bold capitalize">{dateStr} à {timeStr}</span>
                  </div>
                  <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-zinc-600 hover:text-rose-400" title="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <RenderJournalContent raw={rawText} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
