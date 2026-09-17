"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Save, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface DomainVision {
  vision: string;
  purpose: string;
  identity: string;
  values: string;
  beliefs: string;
  resources: string;
  strategy: string;
}

const SEVEN_MAGNIFICENT = [
  { id: "sante-vitalite", name: "1. Santé & Vitalité Physique", example: "Énergie débordante, corps fort et esprit clair." },
  { id: "mental-emotions", name: "2. Maîtrise Mentale & Émotionnelle", example: "Sérénité absolue face aux défis, clarté décisionnelle." },
  { id: "relations-amour", name: "3. Relations & Amour", example: "Connexions profondes, amour inconditionnel et partage." },
  { id: "carriere-mission", name: "4. Carrière & Mission de Vie", example: "Impact majeur, leadership inspirant et épanouissement." },
  { id: "finances-liberte", name: "5. Finances & Indépendance", example: "Abondance, sécurité et liberté financière totale." },
  { id: "contribution-don", name: "6. Contribution & Transmission", example: "Aider les autres, transmettre ses connaissances." },
  { id: "spiritualite-sens", name: "7. Spiritualité & Sens Ultime", example: "Alignement profond avec ses valeurs suprêmes." },
];

export default function VisionPage() {
  const [visionData, setVisionData] = useState<Record<string, DomainVision>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadVisionData();
  }, []);

  async function loadVisionData() {
    try {
      const res = await fetch("/api/vision", { cache: "no-store" });
      if (res.ok) {
        const raw = await res.json();
        const loaded: Record<string, DomainVision> = {};
        raw.forEach((item: any) => {
          try {
            if (item.description && item.description.startsWith("{")) {
              loaded[item.id] = JSON.parse(item.description);
            }
          } catch {}
        });
        setVisionData(loaded);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(domainId: string, field: keyof DomainVision, value: string) {
    setVisionData((prev) => ({
      ...prev,
      [domainId]: {
        ...(prev[domainId] || { vision: "", purpose: "", identity: "", values: "", beliefs: "", resources: "", strategy: "" }),
        [field]: value,
      },
    }));
  }

  async function handleSave(domainId: string, title: string) {
    setSavingId(domainId);
    try {
      await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: domainId, title, details: visionData[domainId] || {} }),
      });
      setTimeout(() => setSavingId(null), 1200);
    } catch (err) {
      console.error(err);
      setSavingId(null);
    }
  }

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
        <p className="mt-1 text-xs text-zinc-400">
          Le plan maître complet de ta vie sur les 7 piliers fondamentaux.
        </p>
      </div>

      <div className="space-y-8">
        {SEVEN_MAGNIFICENT.map((pillar) => {
          const data = visionData[pillar.id] || { vision: "", purpose: "", identity: "", values: "", beliefs: "", resources: "", strategy: "" };

          return (
            <div key={pillar.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-amber-400">{pillar.name}</h2>
                  <p className="text-xs text-zinc-500 italic">Exemple : « {pillar.example} »</p>
                </div>
                <button
                  onClick={() => handleSave(pillar.id, pillar.name)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black"
                >
                  {savingId === pillar.id ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {savingId === pillar.id ? "Enregistré" : "Sauvegarder ce pilier"}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">1. Vision Ultime (Que veux-tu exactement ?)</label>
                  <textarea rows={2} value={data.vision} onChange={(e) => handleChange(pillar.id, "vision", e.target.value)} placeholder="Description précise de l'état idéal..." className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">2. Raison d&apos;être / Pourquoi (Pourquoi est-ce vital ?)</label>
                  <textarea rows={2} value={data.purpose} onChange={(e) => handleChange(pillar.id, "purpose", e.target.value)} placeholder="Leviers émotionnels profonds..." className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">3. Rôle & Identité (Qui dois-je être ?)</label>
                  <input value={data.identity} onChange={(e) => handleChange(pillar.id, "identity", e.target.value)} placeholder="Ex: Athlète discipliné" className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">4. Valeurs Clés</label>
                  <input value={data.values} onChange={(e) => handleChange(pillar.id, "values", e.target.value)} placeholder="Ex: Énergie, Respect, Excellence" className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">5. Croyances Aidantes</label>
                  <input value={data.beliefs} onChange={(e) => handleChange(pillar.id, "beliefs", e.target.value)} placeholder="Ex: Mon corps se régénère chaque jour" className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">6. Ressources Nécessaires</label>
                  <input value={data.resources} onChange={(e) => handleChange(pillar.id, "resources", e.target.value)} placeholder="Ex: Coach, nutrition, 8h de sommeil" className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">7. Stratégies Clés & Objectif à 1 an</label>
                  <textarea rows={2} value={data.strategy} onChange={(e) => handleChange(pillar.id, "strategy", e.target.value)} placeholder="Actions stratégiques incontournables..." className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
