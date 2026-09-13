"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Inbox, Plus, Trash2, Clock, Flame, Scissors, CheckCircle } from "lucide-react";

interface CaptureItem {
  id: string;
  content: string;
  createdAt: string;
}

export default function CapturePage() {
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [content, setContent] = useState("");
  const [timing, setTiming] = useState("15");
  const [isMust, setIsMust] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadCaptures() {
      try {
        const res = await fetch("/api/captures", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCaptures(data);
        }
      } catch (err) {
        console.error("Erreur captures :", err);
      } finally {
        setLoading(false);
      }
    }
    loadCaptures();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);

    const prefix = isMust ? "🔥 [MUST] " : "";
    const suffix = ` ⏱️ (${timing} min)`;
    const finalContent = `${prefix}${content.trim()}${suffix}`;

    try {
      const res = await fetch("/api/captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: finalContent }),
      });

      if (res.ok) {
        const newCapture = await res.json();
        setCaptures((prev) => [newCapture, ...prev]);
        setContent("");
        setIsMust(false);
        setTiming("15");
        router.refresh();
      }
    } catch (err) {
      console.error("Erreur ajout :", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/captures/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCaptures((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au tableau de bord
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
            <Inbox className="h-7 w-7 text-amber-400" />
            Capture <span className="italic text-amber-300">Express RPM</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Libère ton esprit : qualifie (MUST, timing) puis transforme tes pensées en blocs d&apos;actions.
          </p>
        </div>
      </div>

      {/* Formulaire de Capture */}
      <form onSubmit={handleAdd} className="space-y-4 rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-xl">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Qu'as-tu en tête ? (Ex: Préparer la réunion, Réviser les objectifs...)"
          className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sélection du Timing */}
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs text-zinc-400">Timing :</span>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-200 outline-none cursor-pointer"
              >
                <option value="5" className="bg-zinc-900">5 min</option>
                <option value="15" className="bg-zinc-900">15 min</option>
                <option value="30" className="bg-zinc-900">30 min</option>
                <option value="60" className="bg-zinc-900">1h</option>
                <option value="120" className="bg-zinc-900">2h+</option>
              </select>
            </div>

            {/* Selector MUST */}
            <button
              type="button"
              onClick={() => setIsMust(!isMust)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                isMust
                  ? "border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-lg shadow-rose-950/40"
                  : "border-white/10 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Flame className={`h-3.5 w-3.5 ${isMust ? "fill-rose-300" : ""}`} />
              MUST
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40 transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus className="h-4 w-4" />
            Capturer
          </button>
        </div>
      </form>

      {/* Liste des Captures (Inbox & Chunking) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Boîte de réception ({captures.length})
        </h2>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 text-center text-xs text-zinc-500">
            Chargement...
          </div>
        ) : captures.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-zinc-500">
            Boîte de réception vide.
          </div>
        ) : (
          <div className="space-y-2">
            {captures.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0d0d10] p-4 text-sm text-zinc-200 shadow-md"
              >
                <span className="font-medium">{item.content}</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/planifier?captureId=${item.id}`}
                    className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
                    title="Convertir en Bloc RPM (Chunking)"
                  >
                    <Scissors className="h-3.5 w-3.5" />
                    Chunker
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-zinc-600 hover:text-rose-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
