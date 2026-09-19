"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Save, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface DomainVision {
  title?: string;
  vision: string;
  purpose: string;
  identity: string;
  values: string;
  levers: string;
  resources: string;
  strategy: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

const DEFAULT_DOMAINS = [
  { id: "sante-vitalite", name: "1. Santé & Vitalité Physique" },
  { id: "mental-emotions", name: "2. Maîtrise Mentale & Émotionnelle" },
  { id: "relations-amour", name: "3. Relations & Amour" },
  { id: "carriere-mission", name: "4. Carrière & Mission de Vie" },
  { id: "finances-liberte", name: "5. Finances & Indépendance" },
  { id: "contribution-don", name: "6. Contribution & Transmission" },
  { id: "spiritualite-sens", name: "7. Spiritualité & Sens Ultime" },
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
        ...(prev[domainId] || {
          title: "",
          vision: "",
          purpose: "",
          identity: "",
          values: "",
          levers: "",
          resources: "",
          strategy: "",
          q1: "",
          q2: "",
          q3: "",
          q4: "",
        }),
        [field]: value,
      },
    }));
  }

  async function handleSave(domainId: string, defaultName: string) {
    setSavingId(domainId);
    const domainObj = visionData[domainId] || {};
    const finalTitle = domainObj.title?.trim() || defaultName;

    try {
      await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: domainId, title: finalTitle, details: domainObj }),
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
      </div>

      <div className="space-y-8">
        {DEFAULT_DOMAINS.map((pillar) => {
          const data = visionData[pillar.id] || {
            title: pillar.name,
            vision: "",
            purpose: "",
            identity: "",
            values: "",
            levers: "",
            resources: "",
            strategy: "",
            q1: "",
            q2: "",
            q3: "",
            q4: "",
          };

          return (
            <div key={pillar.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
                <input
                  value={data.title ?? pillar.name}
                  onChange={(e) => handleChange(pillar.id, "title", e.target.value)}
                  className="bg-transparent text-lg font-bold text-amber-400 outline-none w-full max-w-md focus:border-b focus:border-amber-400"
                />
                <button
                  onClick={() => handleSave(pillar.id, pillar.name)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black"
                >
                  {savingId === pillar.id ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {savingId === pillar.id ? "Enregistré" : "Sauvegarder"}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">1. Vision Ultime</label>
                  <textarea rows={2} value={data.vision} onChange={(e) => handleChange(pillar.id, "vision", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">2. Raison d&apos;être / Pourquoi</label>
                  <textarea rows={2} value={data.purpose} onChange={(e) => handleChange(pillar.id, "purpose", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">3. Rôle & Identité</label>
                  <input value={data.identity} onChange={(e) => handleChange(pillar.id, "identity", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">4. Valeurs Clés</label>
                  <input value={data.values} onChange={(e) => handleChange(pillar.id, "values", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-300">5. Les 3 Leviers d&apos;Action</label>
                  <input value={data.levers} onChange={(e) => handleChange(pillar.id, "levers", e.target.value)} placeholder="Ex : Routine matinale, Ritualisation, Time-blocking" className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">6. Ressources Nécessaires</label>
                  <input value={data.resources} onChange={(e) => handleChange(pillar.id, "resources", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-300">7. Stratégies Clés & Objectif à 1 an</label>
                  <textarea rows={2} value={data.strategy} onChange={(e) => handleChange(pillar.id, "strategy", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none" />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-amber-300 uppercase">Plan d&apos;étapes Trimestrielles (4 Q)</h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400">Q1 (Jan - Mar)</span>
                    <input value={data.q1} onChange={(e) => handleChange(pillar.id, "q1", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-xs text-zinc-100 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400">Q2 (Avr - Juin)</span>
                    <input value={data.q2} onChange={(e) => handleChange(pillar.id, "q2", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-xs text-zinc-100 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400">Q3 (Juil - Sept)</span>
                    <input value={data.q3} onChange={(e) => handleChange(pillar.id, "q3", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-xs text-zinc-100 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400">Q4 (Oct - Déc)</span>
                    <input value={data.q4} onChange={(e) => handleChange(pillar.id, "q4", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/60 p-2 text-xs text-zinc-100 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
  
