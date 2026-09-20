"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Inbox, Plus, Trash2, Target, HelpCircle, CheckSquare, Layers, Calendar, Archive, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CapturePage() {
  const [captures, setCaptures] = useState<any[]>([]);
  const [existingBlocks, setExistingBlocks] = useState<any[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<Record<string, string>>({});
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [resC, resB] = await Promise.all([
        fetch("/api/captures", { cache: "no-store" }),
        fetch("/api/blocks", { cache: "no-store" }),
      ]);
      if (resC.ok) setCaptures(await resC.json());
      if (resB.ok) setExistingBlocks(await resB.json());
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
        loadData();
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

  async function handleToggleArchive(id: string, currentContent: string, isArchiving: boolean) {
    const newContent = isArchiving ? `[ARCHIVED] ${currentContent}` : currentContent.replace("[ARCHIVED] ", "");
    setCaptures((prev) => prev.map((c) => (c.id === id ? { ...c, content: newContent } : c)));

    try {
      await fetch(`/api/captures/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  function handleConvert(capture: any, mode: "R" | "P" | "M") {
    const targetBlockId = selectedBlockId[capture.id];
    const dateStr = selectedDates[capture.id] || todayStr;
    const paramKey = mode === "R" ? "result" : mode === "P" ? "purpose" : "action";
    const cleanContent = capture.content.replace("[ARCHIVED] ", "");

    let url = `/planifier?${paramKey}=${encodeURIComponent(cleanContent)}&captureId=${capture.id}&date=${dateStr}`;
    if (targetBlockId) url += `&targetBlockId=${targetBlockId}`;

    router.push(url);
  }

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Chargement...</div>;

  const activeCaptures = captures.filter((c) => !c.content.startsWith("[ARCHIVED] "));
  const archivedCaptures = captures.filter((c) => c.content.startsWith("[ARCHIVED] "));

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <Inbox className="h-7 w-7 text-amber-400" />
          Capture <span className="italic text-amber-300">Express</span>
        </h1>
      </div>

      <form onSubmit={handleAdd} className="space-y-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-xl">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ex : Réserver le studio de tournage..."
          className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-sm text-zinc-100 outline-none"
        />
        <div className="flex justify-end">
          <button type="submit" disabled={!content.trim()} className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400">
            <Plus className="h-4 w-4 inline mr-1" /> Capturer
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {/* Boîte de Réception */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-amber-300 uppercase">Boîte de réception ({activeCaptures.length})</h2>
          {activeCaptures.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Boîte de réception vide.</p>
          ) : (
            activeCaptures.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-200 text-sm">{item.content}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggleArchive(item.id, item.content, true)} className="p-1.5 text-zinc-400 hover:text-amber-400" title="Archiver">
                      <Archive className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-zinc-600 hover:text-rose-400" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-xl px-2.5 py-1">
                    <Layers className="h-3.5 w-3.5 text-amber-400" />
                    <select
                      value={selectedBlockId[item.id] || ""}
                      onChange={(e) => setSelectedBlockId((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="bg-transparent text-xs text-zinc-300 outline-none"
                    >
                      <option value="">➕ Nouveau bloc RPM</option>
                      {existingBlocks.map((b) => (
                        <option key={b.id} value={b.id}>
                          📌 {b.result.slice(0, 30)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-xl px-2.5 py-1">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <input
                      type="date"
                      value={selectedDates[item.id] || todayStr}
                      onChange={(e) => setSelectedDates((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="bg-transparent text-xs text-zinc-300 outline-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button onClick={() => handleConvert(item, "R")} className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20">
                      <Target className="h-3.5 w-3.5" /> R
                    </button>
                    <button onClick={() => handleConvert(item, "P")} className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20">
                      <HelpCircle className="h-3.5 w-3.5" /> P
                    </button>
                    <button onClick={() => handleConvert(item, "M")} className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-300 hover:bg-sky-500/20">
                      <CheckSquare className="h-3.5 w-3.5" /> M
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Archives */}
        {archivedCaptures.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-xs font-bold text-zinc-500 uppercase">Captures Traitées / Archivées ({archivedCaptures.length})</h2>
            {archivedCaptures.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/5 bg-black/40 p-4 flex items-center justify-between">
                <span className="text-zinc-500 text-sm line-through">{item.content.replace("[ARCHIVED] ", "")}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleArchive(item.id, item.content, false)} className="p-1.5 text-zinc-400 hover:text-emerald-400" title="Restaurer (Remettre en boîte de réception)">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-zinc-600 hover:text-rose-400" title="Supprimer définitivement">
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
                                                          
