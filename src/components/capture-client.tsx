"use client";

import { useState } from "react";

export function CaptureClient({ areas, roles, captures, weekKey }: any) {
  const [captureList, setCaptureList] = useState(captures);
  const [newContent, setNewContent] = useState("");
  const [selectedCapture, setSelectedCapture] = useState<any>(null);
  const [mode, setMode] = useState<"new_block" | "attach">("new_block");
  const [existingBlocks, setExistingBlocks] = useState<any[]>([]);

  // Formulaire nouveau bloc
  const [title, setTitle] = useState("");
  const [result, setResult] = useState("");
  const [purpose, setPurpose] = useState("");
  const [areaId, setAreaId] = useState("");

  // Formulaire rattachement
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

  const openChunkModal = async (capture: any) => {
    setSelectedCapture(capture);
    setTitle(capture.content);
    setAttachContent(capture.content);
    // Charger les blocs RPM existants pour le menu déroulant
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
      // 1. Créer un nouveau bloc RPM
      await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          result,
          purpose,
          areaId: areaId || null,
          weekStart: weekKey,
        }),
      });
      // Marquer la capture comme traitée
      await fetch(`/api/captures/${selectedCapture.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "processed" }),
      });
    } else {
      // 2. Rattacher à un bloc existant (Action, Résultat ou Pourquoi)
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

    setCaptureList(captureList.filter((c: any) => c.id !== selectedCapture.id));
    setSelectedCapture(null);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Boîte de Réception / Captures</h1>

      <form onSubmit={handleCreateCapture} className="flex gap-2">
        <input
          type="text"
          placeholder="Capturer une idée, un projet ou une action..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="flex-1 border p-2 rounded text-black"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Capturer
        </button>
      </form>

      <div className="space-y-3">
        {captureList
          .filter((c: any) => c.status !== "processed")
          .map((c: any) => (
            <div key={c.id} className="border p-3 rounded flex justify-between items-center bg-white shadow-sm">
              <span className="text-black">{c.content}</span>
              <button
                onClick={() => openChunkModal(c)}
                className="bg-emerald-600 text-white px-3 py-1 rounded text-sm"
              >
                Traiter (Chunk)
              </button>
            </div>
          ))}
      </div>

      {selectedCapture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">Traiter la capture</h2>
            <p className="bg-gray-100 p-2 rounded text-sm font-medium">{selectedCapture.content}</p>

            <div className="flex gap-4 border-b pb-2">
              <button
                type="button"
                className={`font-semibold pb-1 ${mode === "new_block" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                onClick={() => setMode("new_block")}
              >
                Créer un Nouveau Bloc RPM
              </button>
              <button
                type="button"
                className={`font-semibold pb-1 ${mode === "attach" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                onClick={() => setMode("attach")}
              >
                Rattacher à un Bloc Existant
              </button>
            </div>

            {mode === "new_block" ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold block">Titre du bloc</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block">Résultat souhaité (Outcome)</label>
                  <input
                    type="text"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block">Pourquoi / Révolution (Purpose)</label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold block">Contenu à injecter</label>
                  <input
                    type="text"
                    value={attachContent}
                    onChange={(e) => setAttachContent(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block">Sélectionner le Bloc RPM cible</label>
                  <select
                    value={targetBlockId}
                    onChange={(e) => setTargetBlockId(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    {existingBlocks.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.title || b.result || "Bloc sans titre"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block">Rattacher en tant que :</label>
                  <select
                    value={attachType}
                    onChange={(e: any) => setAttachType(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    <option value="action">Action (MAP)</option>
                    <option value="result">Résultat (Outcome)</option>
                    <option value="purpose">Pourquoi (Purpose)</option>
                  </select>
                </div>
                {attachType === "action" && (
                  <div>
                    <label className="text-xs font-bold block">Jour d'assignation (Optionnel)</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Non assigné (Toute la semaine)</option>
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCapture(null)}
                className="px-4 py-2 border rounded"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleProcessCapture}
                className="px-4 py-2 bg-blue-600 text-white rounded font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
