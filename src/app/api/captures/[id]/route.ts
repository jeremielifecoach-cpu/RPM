import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures, actions, rpmBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, targetBlockId, attachType } = body;

    const [capture] = await db
      .select()
      .from(captures)
      .where(eq(captures.id, id));

    if (!capture) {
      return NextResponse.json({ error: "Capture introuvable" }, { status: 404 });
    }

    if (targetBlockId && attachType) {
      const textContent = capture.content;

      if (attachType === "result") {
        await db
          .update(rpmBlocks)
          .set({ result: textContent })
          .where(eq(rpmBlocks.id, targetBlockId));
      } else if (attachType === "purpose") {
        await db
          .update(rpmBlocks)
          .set({ purpose: textContent })
          .where(eq(rpmBlocks.id, targetBlockId));
      } else if (attachType === "action") {
        const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(actions).values({
          id: actionId,
          blockId: targetBlockId,
          content: textContent,
          isMust: false,
          isDone: false,
        });
      }
    }

    const patch: Partial<typeof captures.$inferInsert> = {};
    if (typeof status === "string") patch.status = status;
    if (typeof targetBlockId === "string") patch.targetBlockId = targetBlockId;

    const [updated] = await db
      .update(captures)
      .set(patch)
      .where(eq(captures.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la capture" },
      { status: 500 }
    );
  }
}
