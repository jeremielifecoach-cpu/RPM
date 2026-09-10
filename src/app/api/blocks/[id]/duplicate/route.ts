import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks, actions } from "@/db/schema";
import { eq } from "drizzle-orm";

function addWeeks(dateStr: string, weeks: number) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + weeks * 7);
  return date.toISOString().slice(0, 10);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [sourceBlock] = await db
    .select()
    .from(rpmBlocks)
    .where(eq(rpmBlocks.id, id));

  if (!sourceBlock) {
    return NextResponse.json({ error: "Bloc introuvable" }, { status: 404 });
  }

  const nextWeek = addWeeks(sourceBlock.weekStart, 1);

  const [newBlock] = await db
    .insert(rpmBlocks)
    .values({
      result: sourceBlock.result,
      purpose: sourceBlock.purpose,
      areaId: sourceBlock.areaId,
      roleId: sourceBlock.roleId,
      status: "active",
      weekStart: nextWeek,
    })
    .returning();

  const sourceActions = await db
    .select()
    .from(actions)
    .where(eq(actions.blockId, id));

  if (sourceActions.length > 0) {
    await db.insert(actions).values(
      sourceActions.map((a) => ({
        blockId: newBlock.id,
        content: a.content,
        isMust: a.isMust,
        isDone: false,
        minutes: a.minutes,
        position: a.position,
      }))
    );
  }

  return NextResponse.json(newBlock, { status: 201 });
}
