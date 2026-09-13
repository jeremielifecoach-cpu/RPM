"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Save, Target, CheckCircle } from "lucide-react";

interface AreaItem {
  id: string;
  name: string;
  isPriority: boolean;
}

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
  const [priorityAreas, setPriorityAreas] = useState<AreaItem[]>([]);
  const [visionData, setVisionData] = useState<Record<string, VisionDetails>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Charger les domaines prioritaires sans cache
        const resAreas = await fetch("/api/areas", { cache: "no-store" });
        if (!resAreas.ok) return;
        const allAreas: AreaItem[] = await resAreas.json();
        const topAreas = allAreas.filter((a) => a.isPriority);
        setPriorityAreas(topAreas.length > 0 ? topAreas : allAreas.slice(0, 3));

        // 2. Charger les visions enregistrées
        const resVision = await fetch("/api/vision", { cache: "no-store" });
        if (resVision.ok) {
          const vData = await resVision.json();
          const loadedData: Record<string, VisionDetails> = {};
          
          vData.forEach((v: any) => {
            try {
              // On décode le JSON stocké dans la description
              loadedData[v.id] = typeof v.description === "string" && v.description.startsWith("{") 
                ? JSON.parse(v.description) 
                : { vision: v.description, purpose: "", identity: "", values: "", beliefs: "", strategy: "", resources: "" };
            } catch {
              loadedData[v.id] = { vision: "", purpose: "", identity: "", values: "", beliefs: "", strategy: "", resources: "" };
            }
          });
          setVisionData(loadedData);
        }
      } catch (err) {
        console.error("Erreur chargement Vision:", err);
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
        body: JSON.stringify({
          id: areaId,
          title: title,
          details: visionData[areaId] || {},
          milestones: [] 
        }),
      });
      setTimeout(() => setSavingId(null), 1500);
    } catch (err) {
      console.error("Erreur sauvegarde Vision:", err);
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Chargement de ta Vision Ultime...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <Eye className="h-7 w-7 text-amber-400" />
          Vision des <span className="italic text-amber-300">Magnifiques</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-400">Définis les 7 catégories du succès pour tes domaines prioritaires.</p>
      </div>

      <div className="space-y-12">
        {priorityAreas.map((area) => {
          const data = visionData[area.id] || { vision: "", purpose: "", identity: "", values: "", beliefs: "", strategy: "", resources: "" };
          
          return (
            <div key={area.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
                <h2 className="text-xl font-bold text-amber-400">{area.name}</h2>
                <button
                  onClick={() => handleSave(area.id, area.name)}
                  className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm font-bold text-amber-400 hover:bg-amber-500 hover:text-black transition-all"
                >
                  {savingId === area.id ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {savingId === area.id ? "Sauvegardé" : "Enregistrer ce domaine"}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">1. Vision Ultime (Ce que je veux vraiment)</label>
                  <textarea rows={2} value={data.vision} onChange={(e) => handleChange(area.id, "vision", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50" />
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">2. Raison d&apos;être (Mon Pourquoi absolu)</label>
                  <textarea rows={2} value={data.purpose} onChange={(e) => handleChange(area.id, "purpose", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">3. Rôle / Identité</label>
                  <input value={data.identity} onChange={(e) => handleChange(area.id, "identity", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">4. Valeurs requises</label>
                  <input value={data.values} onChange={(e) => handleChange(area.id, "values", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">5. Croyances aidantes</label>
                  <input value={data.beliefs} onChange={(e) => handleChange(area.id, "beliefs", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">6. Ressources nécessaires</label>
                  <input value={data.resources} onChange={(e) => handleChange(area.id, "resources", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">7. Stratégies Clés & Objectif à 1 an</label>
                  <textarea rows={2} value={data.strategy} onChange={(e) => handleChange(area.id, "strategy", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
