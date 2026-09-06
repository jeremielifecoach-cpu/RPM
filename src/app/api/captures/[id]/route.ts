import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures, actions, rpmBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (body.targetBlockId && body.attachType) {
    const { targetBlockId, attachType, content, dayOfWeek, actionDate } = body;
    const textContent = content || body.content;

    if (attachType === "action") {
      const actionPayload: any = {
        blockId: targetBlockId,
        content: textContent,
        isMust: body.isMust || false,
        isDone: false,
      };
      if (dayOfWeek) actionPayload.dayOfWeek = dayOfWeek;
      if (actionDate) actionPayload.actionDate = actionDate;

      await db.insert(actions).values(actionPayload);
    } else if (attachType === "result") {
      await db
        .update(rpmBlocks)
        .set({ result: textContent, updatedAt: new Date() })
        .where(eq(rpmBlocks.id, targetBlockId));
    } else if (attachType === "purpose") {
      await db
        .update(rpmBlocks)
        .set({ purpose: textContent, updatedAt: new Date() })
        .where(eq(rpmBlocks.id, targetBlockId));
    }

    const [row] = await db
      .update(captures)
      .set({ status: "processed" })
      .where(eq(captures.id, id))
      .returning();

    return NextResponse.json({ ok: true, capture: row });
  }

  const patch: Partial<typeof captures.$inferInsert> = {};
  if (typeof body.content === "string" && body.content.trim())
    patch.content = body.content.trim();
  if (typeof body.status === "string") patch.status = body.status;
  if ("areaId" in body) patch.areaId = body.areaId || null;

  const [row] = await db
    .update(captures)
    .set(patch)
    .where(eq(captures.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(row);
}
