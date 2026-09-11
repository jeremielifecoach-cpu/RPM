"use client";

import { useState } from "react";
import { Area } from "@/db/schema";

interface VisionClientProps {
  initialDomains: any[];
  initialMilestones: any[];
  areas: Area[];
}

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export function VisionClient({ initialDomains, initialMilestones, areas }: VisionClientProps) {
  const [activeDomainIndex, setActiveDomainIndex] = useState(0);
  const [selectedQuarter, setSelectedQuarter] = useState("Q3"); // Par défaut Trimestre courant (ex: Q3 2026)
  const [domains, setDomains] = useState<any[]>(
    initialDomains.length > 0
      ? initialDomains
      : [
          { title: "Domaine Prioritaire 1", quarter: "Q3" },
          { title: "Domaine Prioritaire 2", quarter: "Q3" },
          { title: "Domaine Prioritaire 3", quarter: "Q3" },
        ]
  );

  const [saving, setSaving] = useState(false);

  // Domaine actuellement sélectionné pour édition
  const currentDomain = domains[activeDomainIndex] || {};

  const handleUpdateField = (field: string, value: any) => {
    const updated = [...domains];
    updated[activeDomainIndex] = {
      ...updated[activeDomainIndex],
      [field]: value,
    };
    setDomains(updated);
  };

  const handleUpdateMilestone = (quarter: string, value: string) => {
    const updated = [...domains];
    const milestones = updated[activeDomainIndex]?.milestones || {};
    milestones[quarter] = value;
    updated[activeDomainIndex] = {
      ...updated[activeDomainIndex],
      milestones,
    };
    setDomains(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const domainData = domains[activeDomainIndex];
    
    // Formater les jalons pour l'API
    const milestoneArray = QUARTERS.map((q) => ({
      quarter: q,
      year: 2026,
      targetOutcome: domainData?.milestones?.[q] || "",
      isCurrent: q === selectedQuarter,
    }));

    await fetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...domainData,
        milestones: milestoneArray,
      }),
    });

    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* En-tête Macro CEO */}
      <div className="rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
          Poste de Pilotage Stratégique · Macro-Vision
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-amber-50">
          Les <span className="italic text-amber-400">7 Magnifiques</span>
        </h1>
        <p className="text-xs text-amber-200/60 max-w-3xl">
          Définis la vision, la mission et les jalons trimestriels pour tes 3 domaines de vie prioritaires. Vos blocs RPM hebdomadaires viendront nourrir directement ce moteur d'exécution.
        </p>
      </div>

      {/* Sélection des 3 Domaines Prioritaires */}
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((idx) => {
          const dom = domains[idx];
          const isActive = idx === activeDomainIndex;
          return (
            <button
              key={idx}
              onClick={() => setActiveDomainIndex(idx)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                  : "border-amber-500/20 bg-black/40 hover:border-amber-500/40 text-amber-200/60"
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-amber-500 tracking-widest block">
                Domaine #{idx + 1}
              </span>
              <h3 className="text-sm font-bold text-amber-100 mt-1">
                {dom?.title || `Définir le Domaine ${idx + 1}`}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Formulaire complet des 7 Magnifiques */}
      <div className="rounded-2xl border border-amber-500/20 bg-[#121110] p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-amber-400 animate-pulse"></span>
            <input
              type="text"
              value={currentDomain?.title || ""}
              onChange={(e) => handleUpdateField("title", e.target.value)}
              placeholder="Nom du Domaine (ex: Business & Expansion)..."
              className="bg-transparent text-xl font-bold text-amber-100 focus:outline-none border-b border-amber-500/30 pb-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-amber-200/60">Domaine rattaché :</label>
            <select
              value={currentDomain?.areaId || ""}
              onChange={(e) => handleUpdateField("areaId", e.target.value)}
              className="rounded-lg border border-amber-500/20 bg-[#1a1917] px-3 py-1.5 text-xs text-amber-100 focus:outline-none"
            >
              <option value="">Sélectionner un Domaine de vie</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille du Template exact des 7 Magnifiques */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 1. Vision */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-amber-400 tracking-wider">
              1. Vision (Image claire et désirable)
            </label>
            <textarea
              rows={3}
              value={currentDomain?.vision || ""}
              onChange={(e) => handleUpdateField("vision", e.target.value)}
              placeholder="À quoi ressemble la réussite ultime dans ce domaine ?"
              className="w-full rounded-xl border border-amber-500/20 bg-black/40 p-3 text-xs text-amber-100 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* 2. Mission / Pourquoi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-amber-400 tracking-wider">
              2. Mission (Pourquoi viscéral & justification émotionnelle)
            </label>
            <textarea
              rows={3}
              value={currentDomain?.mission || ""}
              onChange={(e) => handleUpdateField("mission", e.target.value)}
              placeholder="Pourquoi est-ce vital d'atteindre cette vision ?"
              className="w-full rounded-xl border border-amber-500/20 bg-black/40 p-3 text-xs text-amber-100 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* 3. Valeurs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-amber-400 tracking-wider">
              3. Valeurs (Règles du jeu non négociables)
            </label>
            <textarea
              rows={2}
              value={currentDomain?.values || ""}
              onChange={(e) => handleUpdateField("values", e.target.value)}
              placeholder="Ex: Intégrité, Discipline, Impact immédiat..."
              className="w-full rounded-xl border border-amber-500/20 bg-black/40 p-3 text-xs text-amber-100 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* 4. 3 Conducteurs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-amber-400 tracking-wider">
              4. 3 Conducteurs (Leviers d'action & compétences clés)
            </label>
            <textarea
              rows={2}
              value={currentDomain?.drivers || ""}
              onChange={(e) => handleUpdateField("drivers", e.target.value)}
              placeholder="1. Ventes directes / 2. Création de contenus / 3. Rituels quotidiens"
              className="w-full rounded-xl border border-amber-500/20 bg-black/40 p-3 text-xs text-amber-100 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* 5. Ressources */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-amber-400 tracking-wider">
              5. Ressources (Ce que j'ai / Ce qu'il me manque)
            </label>
            <textarea
              rows={2}
              value={currentDomain?.resources || ""}
              onChange={(e) => handleUpdateField("resources", e.target.value)}
              placeholder="Capital disponible, contacts clés / Manque : Mentor, temps dédié..."
              className="w-full rounded-xl border border-amber-500/20 bg-black/40 p-3 text-xs text-amber-100 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* 6. Objectif 1 An (Outcome Binaire) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-amber-400 tracking-wider">
              6. Objectif à 1 An (Résultat binaire et mesurable)
            </label>
            <textarea
              rows={2}
              value={currentDomain?.yearOutcome || ""}
              onChange={(e) => handleUpdateField("yearOutcome", e.target.value)}
              placeholder="Ex: Atteindre 100 000 € de CA avec 50 clients actifs au 31 décembre 2026."
              className="w-full rounded-xl border border-amber-500/20 bg-black/40 p-3 text-xs text-amber-100 focus:border-amber-500/50 focus:outline-none font-semibold"
            />
          </div>
        </div>

        {/* 7. Moteur d'Exécution Trimestriel (Q1, Q2, Q3, Q4) */}
        <div className="pt-6 border-t border-amber-500/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold uppercase text-amber-300 tracking-wider flex items-center gap-2">
              <span>7. Décomposition Trimestrielle (Moteur d'Exécution)</span>
            </label>
            <div className="flex items-center gap-2 text-xs text-amber-200/60">
              <span>Trimestre actif :</span>
              {QUARTERS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSelectedQuarter(q)}
                  className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                    selectedQuarter === q
                      ? "bg-amber-500 text-black shadow-md"
                      : "bg-black/40 text-amber-200/50 hover:text-amber-200"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {QUARTERS.map((q) => {
              const isSelected = selectedQuarter === q;
              return (
                <div
                  key={q}
                  className={`rounded-xl border p-4 space-y-2 transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30"
                      : "border-amber-500/10 bg-black/20 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={isSelected ? "text-amber-300" : "text-amber-200/50"}>
                      Jalon {q}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                        EN COURS
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={currentDomain?.milestones?.[q] || ""}
                    onChange={(e) => handleUpdateMilestone(q, e.target.value)}
                    placeholder={`Objectif cible pour ${q}...`}
                    className="w-full rounded-lg border border-amber-500/20 bg-black/40 p-2 text-xs text-amber-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4 border-t border-amber-500/10">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-6 py-2.5 text-sm font-bold text-amber-300 hover:bg-amber-500/30 transition-all shadow-lg"
          >
            {saving ? "Enregistrement..." : "Sauvegarder la Macro-Vision"}
          </button>
        </div>
      </div>
    </div>
  );
}
