"use client";

import type { Area } from "@/db/schema";

interface WheelOfLifeProps {
  areas: Area[];
  size?: number;
}

export function WheelOfLife({ areas, size = 300 }: WheelOfLifeProps) {
  if (!areas || areas.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 40;
  const step = (2 * Math.PI) / areas.length;

  const points = areas
    .map((a, i) => {
      const angle = step * i - Math.PI / 2;
      const score = a.score ?? 0;
      const r = Math.max((score / 10) * maxR, 4);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={size} height={size} className="overflow-visible">
      {[2, 4, 6, 8, 10].map((level) => (
        <circle
          key={level}
          cx={cx}
          cy={cy}
          r={(level / 10) * maxR}
          fill="none"
          stroke="#27272a"
          strokeWidth="1"
          strokeDasharray={level === 10 ? "none" : "2,2"}
        />
      ))}

      {areas.map((a, i) => {
        const angle = step * i - Math.PI / 2;
        const x2 = cx + Math.cos(angle) * maxR;
        const y2 = cy + Math.sin(angle) * maxR;
        const lx = cx + Math.cos(angle) * (maxR + 18);
        const ly = cy + Math.sin(angle) * (maxR + 18);

        return (
          <g key={a.id || i}>
            <line
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="#27272a"
              strokeWidth="1"
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-zinc-400 text-[10px] font-semibold"
            >
              {a.name}
            </text>
          </g>
        );
      })}

      <polygon
        points={points}
        fill="rgba(245, 185, 60, 0.25)"
        stroke="#f5b93c"
        strokeWidth="2"
      />

      {areas.map((a, i) => {
        const angle = step * i - Math.PI / 2;
        const score = a.score ?? 0;
        const r = Math.max((score / 10) * maxR, 4);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        return (
          <circle
            key={a.id || i}
            cx={x}
            cy={y}
            r="4"
            fill={a.color || "#f5b93c"}
            stroke="#000"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}
