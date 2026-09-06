"use client";

import { useState } from "react";
import { Area, Role, Capture } from "@/db/schema";

interface CaptureClientProps {
  areas: Area[];
  roles: Role[];
  captures: Capture[];
  weekKey: string;
}

export function CaptureClient({ areas, roles, captures, weekKey }: CaptureClientProps) {
  const [captureList, setCaptureList] = useState<Capture[]>(captures);
  const [newContent, setNewContent] = useState("");
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const [mode, setMode] = useState<"new_block" | "attach">("new_block");
  const [existingBlocks, setExistingBlocks] = useState<any[]>([]);

  // Nouveau bloc RPM
  const [title, setTitle] = useState("");
  const [result, setResult] = useState("");
  const [purpose, setPurpose] = useState("");
  const [areaId, setAreaId] = useState("");

  // Rattachement
  const [attachContent, setAttachContent] = useState("");
  const [targetBlockId, setTargetBlockId] = useState("");
  const [attachType, setAttachType] = useState<"action" | "result" | "purpose">("action");
  const [dayOfWeek, setDayOfWeek] = useState("");

  const handleCreateCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    const res = await fetch("/api/captures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    });
    if (res.ok) {
      const created = await res.json();
      setCaptureList([created, ...captureList]);
      setNewContent("");
    }
  };

  const openChunkModal = async (capture: Capture) => {
    setSelectedCapture(capture);
    setTitle(capture.content);
    setAttachContent(capture.content);

    const res = await fetch("/api/blocks?all=true");
    if (res.ok) {
      const data = await res.json();
      setExistingBlocks(data);
      if (data.length > 0) setTargetBlockId(data[0].id);
    }
  };

  const handleProcessCapture = async () => {
    if (!selectedCapture) return;

    if (mode === "new_block") {
      await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          result: result || title,
          purpose,
          areaId: areaId || null,
          weekStart: weekKey,
        }),
      });
      await fetch(`/api/captures/${selectedCapture.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "processed" }),
      });
    } else {
      await fetch(`/api/captures/${selectedCapture.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetBlockId,
          attachType,
          content: attachContent,
          dayOfWeek: dayOfWeek || null,
        }),
      });
    }

    setCaptureList(
      captureList.map((c) =>
        c.id === selectedCapture.id ? { ...c, status: "processed" } : c
      )
    );
    setSelectedCapture(null);
  };

  const handleRestoreCapture = async (id: string) => {
    const res = await fetch(`/api/captures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "inbox" }),
    });
    if (res.ok) {
      setCaptureList(
        captureList.map((c) => (c.id === id ? { ...c, status: "inbox" } : c))
      );
    }
  };

  const handleDeleteCapture = async (id: string) => {
    const res = await fetch(`/api/captures/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCaptureList(captureList.filter((c) => c.id !== id));
    }
  };

  const inboxCaptures = captureList.filter((c) => c.status !== "processed");
  const processedCaptures = captureList.filter((c) => c.status === "processed");

  return (
    <div className="space-y-8">
      {/* En-tête avec carte ambre */}
      <div className="rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-amber-100">
          Capture & Chunking
        </h1>
        <p className="mt-1 text-sm text-amber-200/60">
          Videz votre esprit (Brain Dump), puis transformez vos idées en blocs RPM ou rattachez-les à vos blocs existants.
        </p>

        <form onSubmit={handleCreateCapture} className="mt-6 flex gap-3">
          <input
            type="text"
            placeholder="Une idée, un projet, une tâche en tête..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="flex-1 rounded-xl border border-amber-500/20 bg-black/50 px-4 py-3 text-sm text-amber-100 placeholder:text-amber-200/30 focus:border-amber-500/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-6 py-3 text-sm font-semibold text-amber-300 transition-all hover:bg-amber-500/30"
          >
            Capturer
          </button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Section 1 : Boîte de réception */}
        <div className="rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
            <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              Boîte de réception
            </h2>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/20">
              {inboxCaptures.length}
            </span>
          </div>

          {inboxCaptures.length === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-500/10 p-8 text-center text-xs text-amber-200/40">
              Aucune capture en attente. Votre esprit est libre !
            </div>
          ) : (
            <div className="space-y-3">
              {inboxCaptures.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-amber-500/10 bg-black/40 p-4 transition-all hover:border-amber-500/30"
                >
                  <span className="text-sm font-medium text-amber-100">{c.content}</span>
                  <button
                    onClick={() => openChunkModal(c)}
                    className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-all hover:bg-amber-500/30"
                  >
                    Chunker
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2 : Traitées (Historique & Modification) */}
        <div className="rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
            <h2 className="text-lg font-bold text-amber-100/70 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Captures traitées
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              {processedCaptures.length}
            </span>
          </div>

          {processedCaptures.length === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-500/10 p-8 text-center text-xs text-amber-200/30">
              Aucune capture encore traitée.
            </div>
          ) : (
            <div className="space-y-3">
              {processedCaptures.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-amber-500/10 bg-black/20 p-4 text-amber-200/60"
                >
                  <span className="text-sm line-through decoration-amber-500/40">{c.content}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestoreCapture(c.id)}
                      className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-500/20 transition-all"
                      title="Replacer dans la boîte de réception"
                    >
                      Restaurer
                    </button>
                    <button
                      onClick={() => handleDeleteCapture(c.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modale de Chunking ambre */}
      {selectedCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#121110] p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-amber-100">Traitement de la capture</h3>
              <p className="mt-2 rounded-lg border border-amber-500/20 bg-black/50 p-3 text-sm text-amber-200/80">
                "{selectedCapture.content}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/50 border border-amber-500/20 p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => setMode("new_block")}
                className={`rounded-lg py-2 transition-all ${
                  mode === "new_block"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-amber-200/50 hover:text-amber-200"
                }`}
              >
                Nouveau Bloc RPM
              </button>
              <button
                type="button"
                onClick={() => setMode("attach")}
                className={`rounded-lg py-2 transition-all ${
                  mode === "attach"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-amber-200/50 hover:text-amber-200"
                }`}
              >
                Ajouter à un Bloc Existant
              </button>
            </div>

            {mode === "new_block" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-amber-200/60">Titre du bloc</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-amber-500/20 bg-black/40 px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-200/60">Résultat souhaité (Outcome)</label>
                  <input
                    type="text"
                    placeholder="Qu'est-ce que vous voulez concrètement ?"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-amber-500/20 bg-black/40 px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-200/60">Pourquoi (Purpose / Raisons)</label>
                  <textarea
                    placeholder="Pourquoi est-ce crucial d'atteindre ce résultat ?"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-amber-500/20 bg-black/40 px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-200/60">Domaine de vie (Area)</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-amber-500/20 bg-[#1a1917] px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">Sélectionner un domaine</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-amber-200/60">Contenu à injecter</label>
                  <input
                    type="text"
                    value={attachContent}
                    onChange={(e) => setAttachContent(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-amber-500/20 bg-black/40 px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-200/60">Bloc RPM Cible</label>
                  <select
                    value={targetBlockId}
                    onChange={(e) => setTargetBlockId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-amber-500/20 bg-[#1a1917] px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                  >
                    {existingBlocks.length === 0 ? (
                      <option value="">Aucun bloc trouvé — Créez-en un d'abord</option>
                    ) : (
                      existingBlocks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title || b.result || "Bloc sans titre"}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-200/60">Injecter en tant que</label>
                  <select
                    value={attachType}
                    onChange={(e: any) => setAttachType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-amber-500/20 bg-[#1a1917] px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="action">Action (MAP)</option>
                    <option value="result">Résultat (Outcome)</option>
                    <option value="purpose">Pourquoi (Purpose)</option>
                  </select>
                </div>
                {attachType === "action" && (
                  <div>
                    <label className="text-xs font-semibold text-amber-200/60">Jour de la semaine</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-amber-500/20 bg-[#1a1917] px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">Toute la semaine (Aujourd'hui / Global)</option>
                      <option value="Monday">Lundi</option>
                      <option value="Tuesday">Mardi</option>
                      <option value="Wednesday">Mercredi</option>
                      <option value="Thursday">Jeudi</option>
                      <option value="Friday">Vendredi</option>
                      <option value="Saturday">Samedi</option>
                      <option value="Sunday">Dimanche</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => setSelectedCapture(null)}
                className="rounded-xl border border-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200/70 hover:bg-amber-500/10 transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleProcessCapture}
                className="rounded-xl bg-amber-500/20 border border-amber-500/40 px-5 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/30 transition-all"
              >
                Valider & Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
