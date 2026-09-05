"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2, Fingerprint, Gem, Crown } from "lucide-react";
import { cn, api } from "@/lib/utils";
import type { Role, ValueItem } from "@/db/schema";

const ROLE_COLORS = ["#F5B93C", "#F43F5E", "#EC4899", "#38BDF8", "#34D399", "#A78BFA", "#FB923C", "#FACC15"];

export function RolesClient({
  roles,
  values,
}: {
  roles: Role[];
  values: ValueItem[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [valueName, setValueName] = useState("");
  const [showRoleForm, setShowRoleForm] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function addRole(e: React.FormEvent) {
    e.preventDefault();
    const name = roleName.trim();
    if (!name) return;
    const color = ROLE_COLORS[roles.length % ROLE_COLORS.length];
    setRoleName("");
    setRoleDesc("");
    setShowRoleForm(false);
    await api("/api/roles", {
      method: "POST",
      body: JSON.stringify({ name, description: roleDesc.trim(), color }),
    });
    refresh();
  }

  async function removeRole(id: string) {
    await api(`/api/roles/${id}`, { method: "DELETE" });
    refresh();
  }

  async function addValue(e: React.FormEvent) {
    e.preventDefault();
    const name = valueName.trim();
    if (!name) return;
    setValueName("");
    await api("/api/values", { method: "POST", body: JSON.stringify({ name }) });
    refresh();
  }

  async function removeValue(id: string) {
    await api(`/api/values/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-8">
      <header className="rise">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
          Qui tu es &amp; ce qui compte
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-zinc-50">
          Rôles <span className="italic text-amber-300">&amp;</span> Valeurs
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Dans la méthode RPM, tu ne gères pas des tâches — tu honores des
          rôles et des valeurs. Un rôle répond à « qui suis-je / qui veux-je
          être pour moi et pour les autres ? ». Une valeur répond à « que
          représente ma vie ? ».
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rôles */}
        <section className="rise rise-1 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-zinc-100">
              <Fingerprint className="h-5 w-5 text-amber-400" />
              Tes rôles de vie
            </h2>
            <button
              onClick={() => setShowRoleForm((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors hover:bg-amber-500/15 hover:text-amber-300"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau rôle
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Chaque bloc RPM peut être rattaché à un rôle : tu mesures alors
            l&apos;identité que chaque résultat nourrit.
          </p>

          {showRoleForm && (
            <form
              onSubmit={addRole}
              className="mt-4 space-y-2 rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-4"
            >
              <input
                autoFocus
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ex. Le/la visionnaire, l'athlète, le roc de la famille…"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
              />
              <input
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                placeholder="Une phrase qui incarne ce rôle…"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={!roleName.trim()}
                className="w-full rounded-lg bg-amber-500 py-2 text-xs font-bold text-black transition-colors hover:bg-amber-400 disabled:opacity-40"
              >
                Ajouter ce rôle
              </button>
            </form>
          )}

          <ul className="mt-4 space-y-2.5">
            {roles.map((r) => (
              <li
                key={r.id}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.14]"
              >
                <div
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ backgroundColor: r.color }}
                />
                <div className="flex items-start justify-between gap-3 pl-2">
                  <div>
                    <p className="flex items-center gap-2 font-display text-base font-bold text-zinc-100">
                      <Crown className="h-4 w-4" style={{ color: r.color }} />
                      {r.name}
                    </p>
                    {r.description && (
                      <p className="mt-1 text-xs italic leading-relaxed text-zinc-500">
                        {r.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeRole(r.id)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-zinc-600 opacity-100 transition-colors hover:text-rose-400 lg:opacity-0 lg:group-hover:opacity-100"
                    title="Supprimer ce rôle"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Valeurs */}
        <section className="rise rise-2 rounded-3xl border border-white/[0.07] bg-[#0d0d10]/70 p-6">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-zinc-100">
            <Gem className="h-5 w-5 text-amber-400" />
            Tes valeurs phares
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Les principes qui éclairent chaque décision. Si un résultat n&apos;est
            aligné avec aucune de tes valeurs… ce n&apos;est probablement pas ton
            résultat.
          </p>

          <form onSubmit={addValue} className="mt-4 flex gap-2">
            <input
              value={valueName}
              onChange={(e) => setValueName(e.target.value)}
              placeholder="Ajouter une valeur…"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!valueName.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500 text-black transition-colors hover:bg-amber-400 disabled:opacity-40"
              aria-label="Ajouter la valeur"
            >
              <Plus className="h-5 w-5" strokeWidth={2.6} />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {values.map((v, i) => (
              <span
                key={v.id}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  i === 0
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                    : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25"
                )}
              >
                {i === 0 && <Gem className="h-3.5 w-3.5 text-amber-400" />}
                {v.name}
                <button
                  onClick={() => removeValue(v.id)}
                  className="text-zinc-600 transition-colors hover:text-rose-400"
                  title="Retirer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
            {values.length === 0 && (
              <p className="text-sm text-zinc-600">
                Aucune valeur définie. Quelles sont les forces qui te guident ?
              </p>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5">
            <p className="font-display text-sm italic leading-relaxed text-amber-100/90">
              « La plupart des gens réussissent à brouiller ce qu&apos;ils doivent
              faire avec ce qu&apos;ils CONTRIBUENT à être. Définis tes rôles, et
              tes journées retrouvent un sens. »
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Sage pensée RPM
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
