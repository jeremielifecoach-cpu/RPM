"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Target, Flame, Clock, CheckSquare, Square, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BlockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [block, setBlock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlock();
  }, [id]);

  async function loadBlock() {
    try {
      const res = await fetch("/api/blocks", { cache: "no-store" });
      if (res.ok) {
        const allBlocks = await res.json();
        const found = allBlocks.find((b: any) => b.id === id);
        setBlock(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAction(actionId: string, completed: boolean) {
    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) {
        setBlock((prev: any) => ({
          ...prev,
          actions: prev.actions.map((a: any) => (a.id === actionId ? { ...a, completed: !completed } : a)),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Chargement du bloc...</div>;
  if (!block) return <div className="p-8 text-center text-xs text-zinc-500">Bloc RPM introuvable.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 space-y-6 shadow-xl">
        <div className="border-b border-white/10 pb-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase">Résultat Visé (R)</span>
          <h1 className="text-2xl font-bold text-zinc-100 mt-1">{block.result}</h1>
          {block.purpose && <p className="text-sm italic text-zinc-400 mt-2">&laquo; {block.purpose} &raquo;</p>}
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-amber-300 uppercase">Plan d&apos;Actions Massives (M)</h2>
          {block.actions?.map((act: any) => (
            <div
              key={act.id}
              onClick={() => toggleAction(act.id, act.completed)}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-zinc-200 cursor-pointer hover:border-amber-500/40"
            >
              <div className="flex items-center gap-3">
                {act.completed ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-zinc-500" />}
                <span className={act.completed ? "line-through text-zinc-500" : "font-medium"}>{act.content}</span>
                {act.isMust && <span className="text-rose-400 font-bold">🔥 MUST</span>}
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                {act.minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {act.minutes}m</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
