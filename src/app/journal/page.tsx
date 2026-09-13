"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";

interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadJournal() {
      try {
        // L'instruction { cache: "no-store" } force la lecture de la base de données en direct
        const res = await fetch("/api/journal", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (err) {
        console.error("Erreur journal:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJournal();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setEntries((prev) => [newEntry, ...prev]);
        setContent("");
      }
    } catch (err) {
      console.error("Erreur enregistrement journal:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au tableau de bord
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-amber-400" />
          Journal de <span className="italic text-amber-300">Bord</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Note tes réflexions, victoires et leçons. (Sauvegarde en temps réel)
        </p>
      </div>

      <form onSubmit={handleAdd} className="space-y-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-xl">
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Qu'as-tu appris ou accompli aujourd'hui ?"
          className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40 transition-all"
          >
            <Plus className="h-4 w-4" />
            Enregistrer
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 text-center text-xs text-zinc-500">
            Chargement du journal...
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-zinc-500">
            Ton journal est vide.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="rounded-xl border border-white/10 bg-[#0d0d10] p-5 text-sm text-zinc-200 shadow-md">
                <p className="whitespace-pre-wrap leading-relaxed">{e.content}</p>
                <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-amber-500/60">
                  {new Date(e.createdAt).toLocaleDateString("fr-FR", {
                    hour: "2-digit", minute: "2-digit", day: "numeric", month: "long"
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
