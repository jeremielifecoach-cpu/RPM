"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Inbox, Plus, Trash2, Target, HelpCircle, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

interface CaptureItem {
  id: string;
  content: string;
  createdAt: string;
}

export default function CapturePage() {
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCaptures();
  }, []);

  async function loadCaptures() {
    try {
      const res = await fetch("/api/captures", { cache: "no-store" });
      if (res.ok) setCaptures(await res.json());
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
      const res = await fetch("/api/captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        loadCaptures();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/captures/${id}`, { method: "DELETE" });
      if (res.ok) setCaptures((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <Inbox className="h-7 w-7 text-amber-400" />
          Capture <span className="italic text-amber-300">Express</span>
        </h1>
      </div>

      <form onSubmit={handleAdd} className="space-y-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-5">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note ta pensée brute..."
          className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-sm text-zinc-100 outline-none"
        />
        <div className="flex justify-end">
          <button type="submit" className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400">
            <Plus className="h-4 w-4 inline mr-1" /> Capturer
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-400 uppercase">Boîte de réception ({captures.length})</h2>
        {captures.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0d0d10] p-4 text-sm">
            <span className="flex-1 font-medium text-zinc-200">{item.content}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => router.push(`/planifier?result=${encodeURIComponent(item.content)}&captureId=${item.id}`)}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20"
              >
                <Target className="h-3 w-3" /> Comme Résultat (R)
              </button>
              <button
                onClick={() => router.push(`/planifier?purpose=${encodeURIComponent(item.content)}&captureId=${item.id}`)}
                className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20"
              >
                <HelpCircle className="h-3 w-3" /> Comme Pourquoi (P)
              </button>
              <button
                onClick={() => router.push(`/planifier?action=${encodeURIComponent(item.content)}&captureId=${item.id}`)}
                className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20"
              >
                <CheckSquare className="h-3 w-3" /> Comme Action (M)
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-1 text-zinc-600 hover:text-rose-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
