"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Inbox, Plus, Trash2 } from "lucide-react";

interface CaptureItem {
  id: string;
  content: string;
  createdAt: string;
}

export default function CapturePage() {
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadCaptures() {
      try {
        const res = await fetch("/api/captures");
        if (res.ok) {
          const data = await res.json();
          setCaptures(data);
        }
      } catch (err) {
        console.error("Erreur de chargement des captures :", err);
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

    try {
      const res = await fetch("/api/captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const newCapture = await res.json();
        setCaptures((prev) => [newCapture, ...prev]);
        setContent("");
        router.refresh();
      }
    } catch (err) {
      console.error("Erreur d'ajout :", err);
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
      console.error("Erreur de suppression :", err);
    }
  }

  return (
    <div className="space-y-8">
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
          Capture <span className="italic text-amber-300">Express</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Vide ton esprit : note tout ce qui te préoccupe avant de le transformer en blocs RPM.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Qu'est-ce qui tourne dans ta tête ?"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40 transition-all"
        >
          <Plus className="h-4 w-4" />
          Capturer
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
          Boîte de réception ({captures.length})
        </h2>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 text-center text-xs text-zinc-500">
            Chargement…
          </div>
        ) : captures.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-zinc-500">
            Ta boîte de réception est vide. Ton esprit est clair !
          </div>
        ) : (
          <ul className="space-y-2">
            {captures.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0d0d10] p-4 text-sm text-zinc-200"
              >
                <span>{item.content}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
