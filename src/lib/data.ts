import { db } from "@/db";
import {
  areas,
  roles,
  rpmBlocks,
  actions,
  captures,
  journalEntries,
  valuesTable,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function ensureAreasSeeded() {
  const existing = await db.select().from(areas);
  if (existing.length === 0) {
    await db.insert(areas).values([
      { id: "area-1", name: "Santé & Énergie", focus: "Physique et mental", score: 8 },
      { id: "area-2", name: "Carrière & Business", focus: "Croissance et projets", score: 7 },
      { id: "area-3", name: "Relations & Famille", focus: "Connexions profondes", score: 9 },
    ]);
  }
}

export async function ensureRolesValuesSeeded() {
  const existingRoles = await db.select().from(roles);
  if (existingRoles.length === 0) {
    await db.insert(roles).values([
      { id: "role-1", areaId: "area-1", title: "Athlète conscient", description: "Prendre soin du corps" },
      { id: "role-2", areaId: "area-2", title: "Entrepreneur visionnaire", description: "Bâtir des projets" },
    ]);
  }

  const existingValues = await db.select().from(valuesTable);
  if (existingValues.length === 0) {
    await db.insert(valuesTable).values([
      { id: "val-1", title: "Liberté", description: "Autonomie de temps et d'action" },
      { id: "val-2", title: "Excellence", description: "Donner le meilleur" },
    ]);
  }
}

export async function getAreas() {
  return await db.select().from(areas);
}

export async function getRoles() {
  return await db.select().from(roles);
}

export async function getValues() {
  return await db.select().from(valuesTable);
}

export async function getCaptures() {
  return await db.select().from(captures).orderBy(desc(captures.createdAt));
}

export async function getJournal() {
  return await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
}

export async function getBlockFull(id: string) {
  const blocks = await db.select().from(rpmBlocks).where(eq(rpmBlocks.id, id));
  if (blocks.length === 0) return null;
  const block = blocks[0];
  const blockActions = await db.select().from(actions).where(eq(actions.blockId, id));
  return { ...block, actions: blockActions };
}

export async function getDashboardData() {
  const [areasData, blocksData, actionsData, rolesData] = await Promise.all([
    db.select().from(areas),
    db.select().from(rpmBlocks),
    db.select().from(actions),
    db.select().from(roles),
  ]);

  const formattedBlocks = blocksData.map((block) => ({
    ...block,
    actions: actionsData.filter((action) => action.blockId === block.id),
  }));

  const stats = {
    actionsCount: actionsData.length,
    mustActionsCount: actionsData.filter((a) => a.priority === 1).length,
    blocksCount: blocksData.length,
    activeAreasCount: areasData.length,
    completedActionsCount: actionsData.filter((a) => a.completed).length,
  };

  const today = new Date();
  const todayLabel = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    weekKey: "current",
    weekLabel: "Semaine en cours",
    todayLabel,
    areas: areasData,
    blocks: formattedBlocks,
    stats,
  };
    }
    
