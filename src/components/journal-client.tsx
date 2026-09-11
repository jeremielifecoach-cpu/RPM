"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Sparkles, Trophy, Heart } from "lucide-react";
import { api } from "@/lib/utils";
import type { JournalEntry } from "@/db/schema";

interface JournalClientProps {
  entries: JournalEntry[];
}

export function JournalClient({ entries }: JournalClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [wins, setWins] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [lessons, setLessons] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wins.trim() && !gratitude.trim() && !lessons.trim()) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await api("/journal", {
        method: "POST",
        body: JSON.stringify({
          date: today,
          wins: wins.trim(),
          gratitude: gratitude.trim(),
          lessons: lessons.trim(),
        }),
      });

      setWins("");
      setGratitude("");
      setLessons("");
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Entête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-amber-400" />
          Journal d'Alignement & Célébration
        </h1>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-amber-500/20 bg-[#141210] p-6 space-y-4">
        <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Nouvelle entrée du jour
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" /> Mes victoires du jour
            </label>
            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="Qu'as-tu accompli aujourd'hui ? Qu'as-tu réussi ?"
              rows={2}
              className="w-full rounded-xl bg-[#0d0c0a] border border-white/10 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> Gratitude & Appréciation
            </label>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Pour quoi ou qui es-tu reconnaissant aujourd'hui ?"
              rows={2}
              className="w-full rounded-xl bg-[#0d0c0a] border border-white/10 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-400 mb-1">
              Leçons & Prises de conscience
            </label>
            <textarea
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              placeholder="Qu'as-tu appris aujourd'hui ? Comment vas-tu grandir ?"
              rows={2}
              className="w-full rounded-xl bg-[#0d0c0a] border border-white/10 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (!wins.trim() && !gratitude.trim() && !lessons.trim())}
          className="px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all disabled:opacity-40 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? "Enregistrement..." : "Ancrer dans le journal"}
        </button>
      </form>

      {/* Liste des entrées */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Historique des réflexions ({entries.length})
        </h2>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-zinc-500">
            Aucune entrée dans le journal pour le moment. Exprime tes victoires et gratitudes du jour ci-dessus !
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-amber-500/15 bg-[#12100e] p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {entry.date}
                </span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed">
                {entry.wins && (
                  <div>
                    <span className="font-bold text-emerald-400">Victoires : </span>
                    <span className="text-zinc-200">{entry.wins}</span>
                  </div>
                )}
                {entry.gratitude && (
                  <div>
                    <span className="font-bold text-amber-300">Gratitude : </span>
                    <span className="text-zinc-200">{entry.gratitude}</span>
                  </div>
                )}
                {entry.lessons && (
                  <div>
                    <span className="font-bold text-sky-400">Leçons : </span>
                    <span className="text-zinc-200">{entry.lessons}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
