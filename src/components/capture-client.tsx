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

  // Formulaire Nouveau Bloc RPM
  const [title, setTitle] = useState("");
  const [result, setResult] = useState("");
  const [purpose, setPurpose] = useState("");
  const [areaId, setAreaId] = useState("");

  // Formulaire Rattachement
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
    
    const res = await fetch("/api/blocks");
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

    setCaptureList(captureList.filter((c) => c.id !== selectedCapture.id));
    setSelectedCapture(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Capture & Chunking</h1>
        <p className="text-muted-foreground mt-1">
          Videz votre esprit (Brain Dump), puis transformez vos idées en blocs RPM ou en actions.
        </p>
      </div>

      {/* Barre de saisie */}
      <form onSubmit={handleCreateCapture} className="flex gap-3">
        <input
          type="text"
          placeholder="Une idée, un projet, une tâche en tête..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Capturer
        </button>
      </form>

      {/* Liste des Captures en attente */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Boîte de réception ({captureList.filter(c => c.status !== "processed").length})</h2>
        {captureList.filter((c) => c.status !== "processed").length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Aucune capture en attente. Votre esprit est libre !
          </div>
        ) : (
          captureList
            .filter((c) => c.status !== "processed")
            .map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md"
              >
                <span className="font-medium">{c.content}</span>
                <button
                  onClick={() => openChunkModal(c)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Chunker / Traiter
                </button>
              </div>
            ))
        )}
      </div>

      {/* Modale de Chunking */}
      {selectedCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 text-card-foreground shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold">Traitement de la capture</h3>
              <p className="mt-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                "{selectedCapture.content}"
              </p>
            </div>

            {/* Onglets Choix du Mode */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => setMode("new_block")}
                className={`rounded-lg py-2 transition-all ${
                  mode === "new_block"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Nouveau Bloc RPM
              </button>
              <button
                type="button"
                onClick={() => setMode("attach")}
                className={`rounded-lg py-2 transition-all ${
                  mode === "attach"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ajouter à un Bloc Existant
              </button>
            </div>

            {mode === "new_block" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Titre du bloc</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Résultat souhaité (Outcome)</label>
                  <input
                    type="text"
                    placeholder="Qu'est-ce que vous voulez concrètement ?"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Pourquoi (Purpose / Raisons)</label>
                  <textarea
                    placeholder="Pourquoi est-ce crucial d'atteindre ce résultat ?"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Domaine de vie (Area)</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
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
                  <label className="text-xs font-semibold text-muted-foreground">Contenu</label>
                  <input
                    type="text"
                    value={attachContent}
                    onChange={(e) => setAttachContent(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Bloc RPM Cible</label>
                  <select
                    value={targetBlockId}
                    onChange={(e) => setTargetBlockId(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    {existingBlocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title || b.result || "Bloc sans titre"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Injecter en tant que</label>
                  <select
                    value={attachType}
                    onChange={(e: any) => setAttachType(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    <option value="action">Action (MAP)</option>
                    <option value="result">Résultat (Outcome)</option>
                    <option value="purpose">Pourquoi (Purpose)</option>
                  </select>
                </div>
                {attachType === "action" && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Jour de la semaine</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setSelectedCapture(null)}
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleProcessCapture}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
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
