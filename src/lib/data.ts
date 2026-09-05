import { db } from "@/db";
import {
  actions,
  areas,
  captures,
  journalEntries,
  roles,
  rpmBlocks,
  valuesTable,
} from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import type { BlockFull } from "@/lib/types";

export async function getAreas() {
  return db.select().from(areas).orderBy(asc(areas.position));
}

export async function ensureAreasSeeded() {
  const existing = await db.select().from(areas).limit(1);
  if (existing.length > 0) return;
  const seed = [
    { slug: "corps", name: "Corps & Énergie", icon: "heart", color: "#F43F5E", score: 5, position: 1 },
    { slug: "emotions", name: "Émotions & Sens", icon: "sun", color: "#FB923C", score: 5, position: 2 },
    { slug: "relations", name: "Relations & Famille", icon: "users", color: "#EC4899", score: 5, position: 3 },
    { slug: "temps", name: "Temps & Organisation", icon: "clock", color: "#38BDF8", score: 5, position: 4 },
    { slug: "carriere", name: "Carrière & Mission", icon: "briefcase", color: "#34D399", score: 5, position: 5 },
    { slug: "finances", name: "Finances & Argent", icon: "coins", color: "#A3E635", score: 5, position: 6 },
    { slug: "esprit", name: "Esprit & Contribution", icon: "sparkles", color: "#A78BFA", score: 5, position: 7 },
    { slug: "joie", name: "Joie & Aventure", icon: "party", color: "#FACC15", score: 5, position: 8 },
  ];
  await db.insert(areas).values(seed);
}

export async function ensureRolesValuesSeeded() {
  const r = await db.select().from(roles).limit(1);
  if (r.length === 0) {
    await db.insert(roles).values([
      { name: "Architecte de ma vie", description: "Celui/celle qui dessine la vision et tient le cap.", color: "#F59E0B", position: 1 },
      { name: "Source d'énergie", description: "Celui/celle qui protège son corps, son sommeil et sa vitalité.", color: "#F43F5E", position: 2 },
      { name: "Force & soutien des miens", description: "Celui/celle que les autres peuvent écouter, suivre, aimer.", color: "#EC4899", position: 3 },
    ]);
  }
  const v = await db.select().from(valuesTable).limit(1);
  if (v.length === 0) {
    await db.insert(valuesTable).values([
      { name: "Santé", position: 1 },
      { name: "Amour", position: 2 },
      { name: "Gratitude", position: 3 },
      { name: "Croissance", position: 4 },
      { name: "Passion", position: 5 },
      { name: "Contribution", position: 6 },
    ]);
  }
}

export async function getRoles() {
  return db.select().from(roles).orderBy(asc(roles.position));
}

export async function getValues() {
  return db.select().from(valuesTable).orderBy(asc(valuesTable.position));
}

export async function getCaptures(status?: string) {
  const base = db
    .select({ capture: captures, area: areas })
    .from(captures)
    .leftJoin(areas, eq(captures.areaId, areas.id));
  const rows = status
    ? await base.where(eq(captures.status, status)).orderBy(desc(captures.createdAt))
    : await base.orderBy(asc(captures.status), desc(captures.createdAt));
  return rows.map((r) => ({ ...r.capture, area: r.area ?? null }));
}

export async function getWeekBlocks(weekKey: string): Promise<BlockFull[]> {
  const rows = await db
    .select({ block: rpmBlocks, area: areas, role: roles })
    .from(rpmBlocks)
    .leftJoin(areas, eq(rpmBlocks.areaId, areas.id))
    .leftJoin(roles, eq(rpmBlocks.roleId, roles.id))
    .where(eq(rpmBlocks.weekStart, weekKey))
    .orderBy(desc(rpmBlocks.createdAt));

  const result: BlockFull[] = [];
  for (const r of rows) {
    const acts = await db
      .select()
      .from(actions)
      .where(eq(actions.blockId, r.block.id))
      .orderBy(asc(actions.position), asc(actions.createdAt));
    result.push(withProgress(r.block, acts, r.area ?? null, r.role ?? null));
  }
  return result;
}

export async function getBlockFull(id: string): Promise<BlockFull | null> {
  const rows = await db
    .select({ block: rpmBlocks, area: areas, role: roles })
    .from(rpmBlocks)
    .leftJoin(areas, eq(rpmBlocks.areaId, areas.id))
    .leftJoin(roles, eq(rpmBlocks.roleId, roles.id))
    .where(eq(rpmBlocks.id, id));
  const r = rows[0];
  if (!r) return null;
  const acts = await db
    .select()
    .from(actions)
    .where(eq(actions.blockId, id))
    .orderBy(asc(actions.position), asc(actions.createdAt));
  return withProgress(r.block, acts, r.area ?? null, r.role ?? null);
}

function withProgress(
  block: typeof rpmBlocks.$inferSelect,
  acts: (typeof actions.$inferSelect)[],
  area: (typeof areas.$inferSelect) | null,
  role: (typeof roles.$inferSelect) | null
): BlockFull {
  const done = acts.filter((a) => a.isDone).length;
  const mustLeft = acts.filter((a) => a.isMust && !a.isDone).length;
  const total = acts.length;
  return {
    ...block,
    actions: acts,
    area,
    role,
    doneCount: done,
    totalCount: total,
    mustLeft,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export async function getJournal() {
  return db
    .select()
    .from(journalEntries)
    .orderBy(desc(journalEntries.date), desc(journalEntries.createdAt));
}

export async function getInboxCount(): Promise<number> {
  const res = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(captures)
    .where(eq(captures.status, "inbox"));
  return res[0]?.n ?? 0;
}
