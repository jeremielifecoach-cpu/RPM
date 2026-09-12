"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Area } from "@/db/schema";

export function AreasClient({ initialAreas }: { initialAreas: Area[] }) {
  const router = useRouter();
  const [areasList, setAreasList] = useState(initialAreas);
  const [savingId, setSavingId] = useState<string | null>(null);

  const updateAreaField = async (id: string, field: "score" | "focus", value: unknown) => {
    setAreasList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    setSavingId(id);

    try {
      await fetch(`/api/areas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      router.refresh();
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-bold text-amber-100">Les 7 Magnifiques</h1>
      <div className="grid gap-4">
        {areasList.map((area) => (
          <div key={area.id} className="p-4 rounded-xl bg-[#141210] border border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-300" style={{ color: area.color || undefined }}>
                {area.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Score:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={area.score ?? 5}
                  onChange={(e) => updateAreaField(area.id, "score", Number(e.target.value))}
                  className="w-16 bg-[#0d0c0a] border border-white/10 rounded px-2 py-1 text-xs text-center text-zinc-100"
                />
              </div>
            </div>
            <textarea
              value={area.focus || ""}
              onChange={(e) => updateAreaField(area.id, "focus", e.target.value)}
              placeholder="Focus & Vision pour ce domaine..."
              className="w-full bg-[#0d0c0a] border border-white/10 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none"
              rows={2}
            />
            {savingId === area.id && (
              <span className="text-[10px] text-amber-400">Sauvegarde...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
      }
