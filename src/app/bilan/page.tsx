import { db } from "@/db";
import { actions, rpmBlocks, journalEntries } from "@/db/schema";
import { BilanClient } from "@/components/bilan-client";

export const dynamic = "force-dynamic";

export default async function BilanPage() {
  const [blocks, allActions, entries] = await Promise.all([
    db.select().from(rpmBlocks),
    db.select().from(actions),
    db.select().from(journalEntries),
  ]);
  return <BilanClient blocks={blocks.map((b) => ({ id: b.id, result: b.result, status: b.status, weekStart: b.weekStart }))}
    actions={allActions.map((a) => ({ id: a.id, blockId: a.blockId, content: a.content, completed: Boolean(a.completed || a.isDone), isMust: Boolean(a.isMust) }))}
    reviews={entries.filter((e) => e.date?.startsWith("bilan-")).map((e) => ({ date: e.date!, content: e.content || "" }))} />;
}
