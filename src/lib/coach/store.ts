import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { areas, roles, rpmBlocks, actions, visions, journalEntries } from "@/db/schema";
import type { CoachStore } from "./server";

export const coachStore: CoachStore = {
  async overview() {
    const [vision, domains, roleList, blocks, actionList, reviews] = await Promise.all([
      db.select().from(visions), db.select().from(areas), db.select().from(roles),
      db.select().from(rpmBlocks), db.select().from(actions),
      db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt)).limit(30),
    ]);
    return { vision, domains, roles: roleList, blocks: blocks.map(b => ({...b, actions: actionList.filter(a => a.blockId === b.id).map(a => ({...a, completed: Boolean(a.completed || a.isDone)}))})), reviews };
  },
  async saveBlock(input) {
    const data = { result: input.result, purpose: input.purpose, timeframe: input.deadline, weekStart: input.weekStart, ...(input.areaId ? {areaId: input.areaId} : {}) };
    // A foreign key checks that an explicitly selected area actually exists.
    const [row] = await db.insert(rpmBlocks).values({id: input.id, ...data, status: "active", completed: false})
      .onConflictDoUpdate({ target: rpmBlocks.id, set: data }).returning();
    return row;
  },
  async saveAction(input) {
    return db.transaction(async tx => {
      const [parent] = await tx.select().from(rpmBlocks).where(eq(rpmBlocks.id,input.blockId));
      if (!parent || parent.status === "completed") throw new Error("Bloc inactif ou absent");
      const [existing] = await tx.select().from(actions).where(eq(actions.id,input.id));
      if (existing && existing.blockId !== input.blockId) throw new Error("Déplacement refusé");
      const data = { content: input.content, title: input.content, isMust: input.isMust, minutes: input.minutes };
      const [row] = await tx.insert(actions).values({id:input.id, blockId:input.blockId, ...data, completed:false, isDone:false})
        .onConflictDoUpdate({target:actions.id, set:data}).returning();
      return row;
    });
  },
  async setAction(id, completed) {
    const [row] = await db.update(actions).set({completed, isDone:completed}).where(eq(actions.id,id)).returning();
    if (!row) throw new Error("Action absente"); return row;
  },
  async setBlock(id, completed) {
    const [row] = await db.update(rpmBlocks).set({completed,status:completed?"completed":"active"}).where(eq(rpmBlocks.id,id)).returning();
    if (!row) throw new Error("Bloc absent"); return row;
  },
  async appendReview(input) {
    const content = JSON.stringify({victories:input.wins,reflections:input.lessons,nextAction:input.nextAction,source:"coaching"});
    const [created] = await db.insert(journalEntries).values({id:input.id,date:input.date,wins:input.wins,lessons:input.lessons,content})
      .onConflictDoNothing({target:journalEntries.id}).returning();
    if (created) return created;
    const [existing] = await db.select().from(journalEntries).where(eq(journalEntries.id,input.id));
    if (!existing || existing.content !== content || existing.date !== input.date) throw new Error("ID déjà utilisé");
    return existing;
  },
};
