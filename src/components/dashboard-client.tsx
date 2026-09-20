"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Target, 
  Flame, 
  Clock, 
  CheckSquare, 
  Square, 
  Plus, 
  Sparkles, 
  Layers, 
  Eye, 
  BookOpen 
} from "lucide-react";

interface ActionItem {
  id: string;
  blockId: string;
  content: string;
  isMust?: boolean | null;
  minutes?: number | null;
  completed?: boolean | null;
}

interface BlockFull {
  id: string;
  result: string;
  purpose?: string | null;
  areaId?: string | null;
  weekStart?: string | null;
  actions: ActionItem[];
}

interface AreaItem {
  id: string;
  name: string;
  score?: number | null;
}

interface DashboardClientProps {
  weekKey: string;
  weekLabel: string;
  todayLabel: string;
  areas: AreaItem[];
  blocks: BlockFull[];
  stats?: any;
}

function formatMinutesToHours(minutesInput: any): string {
  const totalMins = Number(minutesInput);
  if (isNaN(totalMins) || totalMins <= 0) return "0h00";
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h${m < 10 ? "0" : ""}${m}`;
}

function parseActionContent(rawContent: string) {
  const match = rawContent.match(/^\[(\d{4}-\d{2}-\d{2})\]\s*(.*)/);
  if (match) {
    const [_, dateStr, text] = match;
    const formattedDate = new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
    return { dateStr: formattedDate, text };
  }
  return { dateStr: null, text: rawContent };
}

function WheelOfLifeChart({ areas }: { areas: AreaItem[] }) {
  if (!areas || areas.length === 0) {
    return <p className="text-xs text-zinc-500 text-center py-8">Aucun domaine configuré.</p>;
  }

  const size = 320;
  const center = size / 2;
  const radius = 95;
  const angleStep = (Math.PI * 2) / areas.length;

  const getPoint = (value: number, index: number, customRadius = radius) => {
    const r = (value / 10) * customRadius;
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = areas.map((a, i) => getPoint(a.score ?? 5, i));
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex w-full justify-center py-4">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="max-w-[320px] overflow-visible">
        {[2, 4, 6, 8, 10].map((level) => {
          const levelPoints = areas.map((_, i) => {
            const p = getPoint(level, i);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={levelPoints}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="1"
            />
          );
        })}

        {areas.map((_, i) => {
          const p = getPoint(10, i);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {areas.length > 2 && (
          <polygon
            points={polygonPoints}
            fill="rgba(251, 191, 36, 0.25)"
            stroke="rgba(251, 191, 36, 0.9)"
            strokeWidth="2"
            className="transition-all duration-700"
          />
        )}

        {areas.map((area, i) => {
          const p = getPoint(area.score ?? 5, i);
          const labelP = getPoint(10, i, radius + 25);
          
          let textAnchor: "middle" | "start" | "end" = "middle";
          if (labelP.x < center - 10) textAnchor = "end";
          if (labelP.x > center + 10) textAnchor = "start";

          return (
            <g key={`data-${i}`}>
              <circle cx={p.x} cy={p.y} r="4" fill="#fbbf24" />
              <text
                x={labelP.x}
                y={labelP.y - 6}
                fill="#a1a1aa"
                fontSize="11"
                fontWeight="600"
                textAnchor={textAnchor}
                dominantBaseline="middle"
              >
                {area.name.length > 18 ? area.name.slice(0, 18) + "..." : area.name}
              </text>
              <text
                x={labelP.x}
                y={labelP.y + 8}
                fill="#fbbf24"
                fontSize="11"
                fontWeight="bold"
                textAnchor={textAnchor}
                dominantBaseline="middle"
              >
                {area.score ?? 5}/10
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DashboardClient({
  todayLabel,
  areas = [],
  blocks: initialBlocks = [],
  stats = {},
}: DashboardClientProps) {
  const [blocksList, setBlocksList] = useState<BlockFull[]>(initialBlocks);

  async function toggleAction(actionId: string, currentCompleted: boolean) {
    const nextState = !currentCompleted;
    setBlocksList((prevBlocks) =>
      prevBlocks.map((b) => ({
        ...b,
        actions: b.actions.map((a) => (a.id === actionId ? { ...a, completed: nextState } : a)),
      }))
    );

    try {
      await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextState }),
      });
    } catch (err) {
      console.error("Erreur toggle action :", err);
    }
  }

  const allActions = blocksList.flatMap((b) => b.actions || []);
  const activeBlocksCount = blocksList.length;
  const mustActions = allActions.filter((a) => a.isMust);
  const mustCompletedCount = mustActions.filter((a) => a.completed).length;
  const mustTotalCount = mustActions.length;

  const totalActionsCount = allActions.length;
  const completedActionsCount = allActions.filter((a) => a.completed).length;
  const safeMomentum = totalActionsCount > 0 ? Math.round((completedActionsCount / totalActionsCount) * 100) : 0;

  const rawMinutes = allActions.filter((a) => !a.completed).reduce((acc, a) => acc + (a.minutes || 15), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-100">
            Tableau de <span className="italic text-amber-300">Bord RPM</span>
          </h1>
          <p className="text-xs text-zinc-400 capitalize">{todayLabel}</p>
        </div>
        <Link
          href="/capture"
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400 shadow-lg shadow-amber-500/10"
        >
          <Plus className="h-4 w-4" /> Capture Express
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase">
            <span>Blocs Actifs</span>
            <Target className="h-4 w-4" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-zinc-100">{activeBlocksCount}</div>
          <p className="mt-1 text-[11px] text-zinc-500">Blocs enregistrés</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase">
            <span>MUST Honnêtes</span>
            <Flame className="h-4 w-4" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-zinc-100">
            {mustCompletedCount}/{mustTotalCount}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Engagements prioritaires</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase">
            <span>Élan de Semaine</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-zinc-100">{safeMomentum}%</div>
          <p className="mt-1 text-[11px] text-zinc-500">Actions accomplies</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase">
            <span>Moments Restants</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-zinc-100">
            {formatMinutesToHours(rawMinutes)}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Temps estimé devant toi</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Link href="/planifier" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-4 text-xs font-bold text-zinc-200 hover:border-amber-400/50 hover:text-amber-300 transition-all">
          <Layers className="h-5 w-5 text-amber-400" /> Planification RPM
        </Link>
        <Link href="/domaines" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-4 text-xs font-bold text-zinc-200 hover:border-amber-400/50 hover:text-amber-300 transition-all">
          <Target className="h-5 w-5 text-amber-400" /> Roue de la Vie
        </Link>
        <Link href="/vision" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-4 text-xs font-bold text-zinc-200 hover:border-amber-400/50 hover:text-amber-300 transition-all">
          <Eye className="h-5 w-5 text-amber-400" /> Vision 7 Magnifiques
        </Link>
        <Link href="/journal" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d0d10] p-4 text-xs font-bold text-zinc-200 hover:border-amber-400/50 hover:text-amber-300 transition-all">
          <BookOpen className="h-5 w-5 text-amber-400" /> Journal Quotidien
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-amber-300 uppercase flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-400" /> Les MUST de ta semaine
          </h2>
          {mustActions.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Aucune action MUST définie pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {mustActions.map((act) => {
                const { dateStr, text } = parseActionContent(act.content);
                const isCompleted = Boolean(act.completed);

                return (
                  <div
                    key={act.id}
                    onClick={() => toggleAction(act.id, isCompleted)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-200 cursor-pointer hover:border-amber-400/40 transition-all select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {isCompleted ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                      )}
                      <span className={isCompleted ? "line-through text-zinc-500" : "font-medium"}>
                        {text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      {dateStr && <span className="text-amber-300/80 font-semibold">📅 {dateStr}</span>}
                      {act.minutes && <span>⏱️ {act.minutes}m</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d10] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-300 uppercase">Roue de ta vie</h2>
            <Link href="/domaines" className="text-xs font-bold text-amber-400 hover:underline">Ajuster</Link>
          </div>
          
          <WheelOfLifeChart areas={areas} />
        </div>
      </div>
    </div>
  );
}
