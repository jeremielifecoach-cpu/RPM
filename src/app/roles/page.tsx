"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck, Plus, Shield } from "lucide-react";

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
}

export default function RolesPage() {
  const [rolesList, setRolesList] = useState<RoleItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await fetch("/api/roles");
        if (res.ok) {
          const data = await res.json();
          setRolesList(data);
        }
      } catch (err) {
        console.error("Erreur chargement rôles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      if (res.ok) {
        const newRole = await res.json();
        setRolesList((prev) => [...prev, newRole]);
        setName("");
        setDescription("");
      }
    } catch (err) {
      console.error("Erreur ajout rôle:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au tableau de bord
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <Shield className="h-7 w-7 text-amber-400" />
          Mes <span className="italic text-amber-300">Rôles & Identités</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Définis qui tu dois être dans chaque domaine de ta vie pour obtenir tes résultats.
        </p>
      </div>

      <form onSubmit={handleAdd} className="space-y-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-5">
        <h2 className="text-sm font-bold text-zinc-200">Ajouter un nouveau rôle</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du rôle (ex: Athlète conscient)"
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description / Identité"
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40 transition-all"
        >
          <Plus className="h-4 w-4" />
          Ajouter ce rôle
        </button>
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 text-center text-xs text-zinc-500">
            Chargement des rôles...
          </div>
        ) : rolesList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-zinc-500">
            Aucun rôle défini pour le moment.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rolesList.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/10 bg-[#0d0d10] p-4">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <UserCheck className="h-4 w-4" />
                  {r.name}
                </div>
                {r.description && <p className="mt-1 text-xs text-zinc-400">{r.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
