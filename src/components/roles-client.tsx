"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Crown } from "lucide-react";
import { cn, api } from "@/lib/utils";
import type { Role } from "@/db/schema";

export interface ValueItem {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  rank?: number;
}

interface RolesClientProps {
  roles: Role[];
  values?: ValueItem[];
}

export function RolesClient({ roles, values = [] }: RolesClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [roleList, setRoleList] = useState<Role[]>(roles);
  const [newRoleName, setNewRoleName] = useState("");

  function refresh() {
    startTransition(() => router.refresh());
  }

  const addRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const res = await api("/roles", {
        method: "POST",
        body: JSON.stringify({ name: newRoleName.trim() }),
      });
      const created = await res.json();
      setRoleList((prev) => [...prev, created]);
      setNewRoleName("");
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await api(`/roles/${id}`, { method: "DELETE" });
      setRoleList((prev) => prev.filter((r) => r.id !== id));
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-400" />
          Mes Rôles de Vie
        </h1>
      </div>

      <form onSubmit={addRole} className="flex gap-2">
        <input
          type="text"
          placeholder="Nouveau rôle (ex: CEO, Père inspirant, Athlète)..."
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          className="flex-1 rounded-xl bg-[#171513] border border-amber-500/20 px-4 py-3 text-xs text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/50"
        />
        <button
          type="submit"
          className="px-4 py-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {roleList.map((role) => (
          <div
            key={role.id}
            className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-[#141210] p-4 text-xs"
          >
            <span className="font-bold text-amber-100">{role.name}</span>
            <button
              onClick={() => deleteRole(role.id)}
              className="text-amber-200/30 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {values.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-amber-500/10">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Valeurs de Vie
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {values.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-amber-500/10 bg-[#121110] p-3 text-xs"
              >
                <div className="font-bold text-amber-200">
                  {v.title || v.name}
                </div>
                {v.description && (
                  <p className="text-amber-200/60 mt-1">{v.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
