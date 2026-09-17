"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Save, CheckCircle, Calendar, Sparkles, Trophy, Brain } from "lucide-react";

export const dynamic = "force-dynamic";

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [gratitudes, setGratitudes] = useState<string[]>(["", "", ""]);
  const [victories, setVictories] = useState("");
  const [reflections, setReflections] = useState("");
  const [scoreDay, setScoreDay] = useState(8);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadJournalForDate(selectedDate);
  }, [selectedDate]);

  async function loadJournalForDate(date: string) {
    try {
      const res = await fetch(`/api/journal?date=${date}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0 && data[0].content) {
          try {
            const parsed = JSON.parse(data[0].content);
            setGratitudes(parsed.gratitudes || ["", "", ""]);
            setVictories(parsed.victories || "");
            setReflections(parsed.reflections || "");
            setScoreDay(parsed.scoreDay || 8);
            return;
          } catch {}
        }
      }
      setGratitudes(["", "", ""]);
      setVictories("");
      setReflections("");
      setScoreDay(8);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          gratitudes,
          victories,
          reflections,
          scoreDay,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-amber-400" />
            Journal <span className="italic text-amber-300">RPM Quotidien</span>
          </h1>
        </div>

        {/* Sélecteur de date */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d0d10] px-3.5 py-2">
          <Calendar className="h-4 w-4 text-amber-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-zinc-100 outline-none cursor-pointer"
          />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gratitude */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-amber-300 uppercase flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> 1. Gratitude du jour (3 éléments)
          </h2>
          <p className="text-xs text-zinc-500 italic">« Quels sont les 3 moments ou personnes pour lesquels je suis reconnaissant aujourd&apos;hui ? »</p>
          {gratitudes.map((g, i) => (
            <input
              key={i}
              value={g}
              onChange={(e) => {
                const next = [...gratitudes];
                next[i] = e.target.value;
                setGratitudes(next);
              }}
              placeholder={`Gratitude #${i + 1}`}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-zinc-100 outline-none"
            />
          ))}
        </div>

        {/* Victoires */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-amber-300 uppercase flex items-center gap-2">
            <Trophy className="h-4 w-4" /> 2. Victoires & Progrès
          </h2>
          <p className="text-xs text-zinc-500 italic">« Quels résultats ai-je créés ou célébrés aujourd&apos;hui ? »</p>
          <textarea
            rows={3}
            value={victories}
            onChange={(e) => setVictories(e.target.value)}
            placeholder="Mes réussites du jour..."
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-zinc-100 outline-none"
          />
        </div>

        {/* Réflexion */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-amber-300 uppercase flex items-center gap-2">
            <Brain className="h-4 w-4" /> 3. Réflexion & Ajustement
          </h2>
          <p className="text-xs text-zinc-500 italic">« Qu&apos;ai-je appris ? Que puis-je améliorer demain ? »</p>
          <textarea
            rows={3}
            value={reflections}
            onChange={(e) => setReflections(e.target.value)}
            placeholder="Mes apprentissages..."
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-zinc-100 outline-none"
          />
        </div>

        {/* Score du jour */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300">Évaluation de ma journée :</span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1" max="10"
              value={scoreDay}
              onChange={(e) => setScoreDay(Number(e.target.value))}
              className="accent-amber-400 cursor-pointer"
            />
            <span className="text-amber-400 font-bold text-sm w-8">{scoreDay}/10</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400"
        >
          {saved ? <CheckCircle className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          {saved ? "Journal Enregistré !" : "Enregistrer mon Journal"}
        </button>
      </form>
    </div>
  );
}
