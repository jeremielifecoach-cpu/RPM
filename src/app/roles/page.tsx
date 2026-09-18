"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Plus, Save, CheckCircle, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface RoleDetails {
  identity: string;
  purpose: string;
  keyResult: string;
}

interface RoleItem {
  id: string;
  name: string;
  details: RoleDetails;
}

export default function RolesPage() {
  const [rolesList, setRolesList] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      const res = await fetch("/api/roles", { cache: "no-store" });
      if (res.ok) {
        const raw = await res.json();
        const parsed = raw.map((r: any) => {
          let details: RoleDetails = { identity: "", purpose: "", keyResult: "" };
          try {
            if (r.description && r.description.startsWith("{")) {
              details = JSON.parse(r.description);
            }
          } catch {}
          return { id: r.id, name: r.name, details };
        });
        setRolesList(parsed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddRole() {
    const newRole: RoleItem = {
      id: crypto.randomUUID(),
      name: "Nouveau Rôle (ex : Leader, Parent, Athlète)",
      details: { identity: "", purpose: "", keyResult: "" },
    };
    setRolesList((prev) => [newRole, ...prev]);
  }

  function updateRoleField(id: string, field: "name" | keyof RoleDetails, value: string) {
    setRolesList((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "name") return { ...r, name: value };
        return { ...r, details: { ...r.details, [field]: value } };
      })
    );
  }

  async function handleSave(role: RoleItem) {
    setSavingId(role.id);
    try {
      await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: role.id, name: role.name, details: role.details }),
      });
      setTimeout(() => setSavingId(null), 1200);
    } catch (err) {
      console.error(err);
      setSavingId(null);
    }
  }

  async function handleDeleteRole(id: string) {
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRolesList((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Chargement des rôles...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
            <Shield className="h-7 w-7 text-amber-400" />
            Rôles & <span className="italic text-amber-300">Identités</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Définit qui tu dois être pour accomplir tes résultats sans forcer.
          </p>
        </div>
        <button onClick={handleAddRole} className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400">
          <Plus className="h-4 w-4" /> Ajouter un Rôle
        </button>
      </div>

      <div className="space-y-6">
        {rolesList.map((role) => (
          <div key={role.id} className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
              <input
                value={role.name}
                onChange={(e) => updateRoleField(role.id, "name", e.target.value)}
                className="bg-transparent text-lg font-bold text-amber-400 outline-none w-full"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave(role)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black"
                >
                  {savingId === role.id ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {savingId === role.id ? "Enregistré" : "Sauvegarder"}
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="p-1.5 text-zinc-600 hover:text-rose-400"
                  title="Supprimer ce rôle"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Identité / Déclaration</label>
                <span className="text-[10px] text-zinc-500 italic block mb-1">« Qui suis-je dans ce rôle ? »</span>
                <textarea
                  rows={3}
                  value={role.details.identity}
                  onChange={(e) => updateRoleField(role.id, "identity", e.target.value)}
                  placeholder="Ex : Un guide inspirant, calme et inébranlable."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Raison d&apos;être (Pourquoi)</label>
                <span className="text-[10px] text-zinc-500 italic block mb-1">« Pourquoi ce rôle compte-t-il ? »</span>
                <textarea
                  rows={3}
                  value={role.details.purpose}
                  onChange={(e) => updateRoleField(role.id, "purpose", e.target.value)}
                  placeholder="Ex : Pour offrir la meilleure vie à mes proches et transmettre."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Résultat Clé Associé</label>
                <span className="text-[10px] text-zinc-500 italic block mb-1">« Quelle est la preuve de réussite ? »</span>
                <textarea
                  rows={3}
                  value={role.details.keyResult}
                  onChange={(e) => updateRoleField(role.id, "keyResult", e.target.value)}
                  placeholder="Ex : 100% de présence d'esprit lors des réunions d'équipe."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-100 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
