"use client";

import { useMemo, useState } from "react";
import type { Area } from "@/db/schema";

/**
 * Roue d'équilibre de vie — visualisation polaire des domaines (0–10).
 * Chaque spicule représente un domaine ; son rayon reflète le niveau de satisfaction.
 */
export function WheelOfLife({
  areas,
  size = 340,
  interactive = false,
  onSelect,
}: {
  areas: Area[];
  size?: number;
  interactive?: boolean;
  onSelect?: (area: Area) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const n = Math.max(areas.length, 1);
  const step = (Math.PI * 2) / n;

  const rings = [2, 4, 6, 8, 10].map((v) => (v / 10) * maxR);

  const spokes = useMemo(
    () =>
      areas.map((a, i) => {
        const angle = step * i - Math.PI / 2;
        const r = Math.max((a.score / 10) * maxR, 4);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const lx = cx + Math.cos(angle) * (maxR + 18);
        const ly = cy + Math.sin(angle) * (maxR + 18);
        return { area: a, angle, x, y, lx, ly };
      }),
    [areas, cx, cy, maxR, step]
  );

  const polygon = spokes.map((s) => `${s.x},${s.y}`).join(" ");

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="wheelFill" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#f5b93c" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#f5b93c" stopOpacity="0.04" />
          </radialGradient>
        </defs>
        {/* Anneaux */}
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={i === rings.length - 1 ? 0.14 : 0.06}
            strokeDasharray={i === rings.length - 1 ? "" : "2 5"}
          />
        ))}
        {/* Axes */}
        {spokes.map((s) => (
          <line
            key={`axis-${s.area.id}`}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(s.angle) * maxR}
            y2={cy + Math.sin(s.angle) * maxR}
            stroke="#ffffff"
            strokeOpacity={hovered === s.area.id ? 0.25 : 0.08}
            strokeWidth={hovered === s.area.id ? 1.4 : 1}
          />
        ))}
        {/* Polygone de vie */}
        {areas.length > 2 && (
          <polygon
            points={polygon}
            fill="url(#wheelFill)"
            stroke="#f5b93c"
            strokeOpacity="0.65"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        )}
        {/* Points */}
        {spokes.map((s) => (
          <g key={`pt-${s.area.id}`}>
            <circle
              cx={s.x}
              cy={s.y}
              r={hovered === s.area.id ? 13 : 10}
              fill={s.area.color}
              fillOpacity={0.25}
            />
            <circle
              cx={s.x}
              cy={s.y}
              r={6.5}
              fill={s.area.color}
              stroke="#070708"
              strokeWidth="2.5"
              className={interactive ? "cursor-pointer transition-transform duration-200" : ""}
              onMouseEnter={() => setHovered(s.area.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect?.(s.area)}
            />
          </g>
        ))}
        {/* Libellés */}
        {spokes.map((s) => {
          const words = s.area.name.split(" ");
          const anchor =
            Math.abs(Math.cos(s.angle)) < 0.35
              ? "middle"
              : Math.cos(s.angle) > 0
              ? "start"
              : "end";
          return (
            <text
              key={`lbl-${s.area.id}`}
              x={s.lx}
              y={s.ly}
              textAnchor={anchor}
              className="select-none"
              fill={hovered === s.area.id ? s.area.color : "#a1a1aa"}
              fontSize="10.5"
              fontWeight={600}
              style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              {words.map((w, wi) => (
                <tspan key={wi} x={s.lx} dy={wi === 0 ? -((words.length - 1) * 6) : 12}>
                  {w}
                </tspan>
              ))}
            </text>
          );
        })}
        {/* Centre */}
        <circle cx={cx} cy={cy} r={3} fill="#f5b93c" />
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          {(() => {
            const a = areas.find((x) => x.id === hovered);
            if (!a) return null;
            return (
              <div className="rounded-2xl border border-white/10 bg-[#0d0d10]/95 px-4 py-2.5 shadow-2xl backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  {a.name}
                </p>
                <p className="font-display text-2xl font-bold" style={{ color: a.color }}>
                  {a.score}
                  <span className="text-sm text-zinc-500">/10</span>
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
