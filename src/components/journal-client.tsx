"use client";

import { useState, useMemo } from "react";
import type { JournalEntry } from "@/db/schema";

interface JournalClientProps {
  entries: JournalEntry[];
}

export function JournalClient({ entries }: JournalClientProps) {
  const [filter, setFilter] = useState<string>("tout");

  const grouped = useMemo(() => {
    const list = entries;
    const map = new Map<string, JournalEntry[]>();
    for (const e of list) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-100">Journal d'alignement</h1>
      </div>

      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([date, dayEntries]) => (
          <div key={date} className="rounded-2xl border border-amber-500/20 bg-[#141210] p-5 space-y-3">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{date}</h2>
            {dayEntries.map((entry) => (
              <div key={entry.id} className="space-y-2 text-xs text-amber-200/80">
                {entry.wins && (
                  <div>
                    <span className="font-bold text-emerald-400">Victoires : </span>
                    {entry.wins}
                  </div>
                )}
                {entry.gratitude && (
                  <div>
                    <span className="font-bold text-amber-300">Gratitude : </span>
                    {entry.gratitude}
                  </div>
                )}
                {entry.lessons && (
                  <div>
                    <span className="font-bold text-sky-400">Leçons : </span>
                    {entry.lessons}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
