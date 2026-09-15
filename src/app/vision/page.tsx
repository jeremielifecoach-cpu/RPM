"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Save, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface VisionDetails {
  vision: string;
  purpose: string;
  identity: string;
  values: string;
  beliefs: string;
  strategy: string;
  resources: string;
}

export default function VisionPage() {
  const [priorityAreas, setPriorityAreas] = useState<any[]>([]);
  const [visionData, setVisionData] = useState<Record<string, VisionDetails>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const resAreas = await fetch("/api/areas", { cache: "no-store" });
        if (resAreas.ok) {
          const allAreas = await resAreas.json();
          const topAreas = allAreas.filter((a: any) => a.isPriority);
          setPriorityAreas(topAreas.length > 0 ? topAreas : allAreas.slice(0, 3));
        }

        const resVision = await fetch("/api/vision", { cache: "no-store" });
        if (resVision.ok) {
          const vData = await resVision.json();
          const loadedData: Record<string, VisionDetails> = {};
          vData.forEach((v: any) => {
            try {
              loadedData[v.id] = typeof v.description === "string" && v.description.startsWith("{")
                ? JSON.parse(v.description)
                : { vision: v.description || "", purpose: "", identity: "", values: "", beliefs: "", strategy: "", resources: "" };
            } catch {
              loadedData[v.id] = { vision: "", purpose: "", identity: "", values: "", beliefs: "", strategy: "", resources: "" };
            }
          });
          setVisionData(loadedData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (areaId: string, field: keyof VisionDetails, value: string) => {
    setVisionData((prev) => ({
      ...prev,
      [areaId]: {
        ...(prev[areaId] || { vision: "", purpose: "", identity: "", values: "", beliefs: "", strategy: "", resources: "" }),
        [field]: value,
      },
    }));
  };

  const handleSave = async (areaId: string, title: string) => {
    setSavingId(areaId);
    try {
      await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: areaId, title, details: visionData[areaId] || {} }),
      });
      setTimeout(() => setSavingId(null), 1500);
    } catch (err) {
      console.error(err);
      setSavingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Chargement de la Vision...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <Eye className="h-7 w-7 text-amber-400" />
          Vision des <span className="italic text-amber-300">7 Magnifiques</span>
        </h1>
      </div>

      <div className="space-y-10">
        {priorityAreas.map((area) => {
          const data = visionData[area.id] || { vision: "", purpose: "", identity: "", values: "", beliefs: "", strategy: "", resources: "" };

          return (
            <div key={area.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-lg font-bold text-amber-400">{area.name}</h2>
                <button
                  onClick={() => handleSave(area.id, area.name)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-black"
                >
                  {savingId === area.id ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {savingId === area.id ? "Sauvegardé" : "Enregistrer ce domaine"}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">1. Vision Ultime</label>
                  <textarea rows={2} value={data.vision} onChange={(e) => handleChange(area.id, "vision", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">2. Raison d&apos;être / Pourquoi</label>
                  <textarea rows={2} value={data.purpose} onChange={(e) => handleChange(area.id, "purpose", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">3. Rôle / Identité</label>
                  <input value={data.identity} onChange={(e) => handleChange(area.id, "identity", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">4. Valeurs</label>
                  <input value={data.values} onChange={(e) => handleChange(area.id, "values", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">5. Croyances aidantes</label>
                  <input value={data.beliefs} onChange={(e) => handleChange(area.id, "beliefs", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">6. Ressources nécessaires</label>
                  <input value={data.resources} onChange={(e) => handleChange(area.id, "resources", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">7. Stratégies Clés & Objectifs à 1 an</label>
                  <textarea rows={2} value={data.strategy} onChange={(e) => handleChange(area.id, "strategy", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-zinc-100 outline-none" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
