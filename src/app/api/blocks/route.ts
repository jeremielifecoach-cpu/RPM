import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks, actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const blocksData = await db.select().from(rpmBlocks);
    const actionsData = await db.select().from(actions);

    const fullBlocks = blocksData.map((b) => ({
      ...b,
      actions: actionsData.filter((a) => a.blockId === b.id),
    }));

    return NextResponse.json(fullBlocks);
  } catch (error) {
    return NextResponse.json({ error: "Erreur chargement" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mode Duplication ou Report
    if (body.actionType === "duplicate" || body.actionType === "carryOver") {
      const original = await db.select().from(rpmBlocks).where(eq(rpmBlocks.id, body.blockId));
      if (original.length === 0) return NextResponse.json({ error: "Bloc introuvable" }, { status: 400 });

      const newWeek = body.actionType === "carryOver" ? "next" : original[0].weekStart;
      const newBlockId = crypto.randomUUID();

      const [cloned] = await db
        .insert(rpmBlocks)
        .values({
          id: newBlockId,
          areaId: original[0].areaId,
          result: body.actionType === "carryOver" ? `[Suivi] ${original[0].result}` : `${original[0].result} (Copie)`,
          purpose: original[0].purpose,
          weekStart: newWeek,
          status: "active",
        })
        .returning();

      const oldActions = await db.select().from(actions).where(eq(actions.blockId, body.blockId));
      for (const act of oldActions) {
        await db.insert(actions).values({
          id: crypto.randomUUID(),
          blockId: newBlockId,
          content: act.content,
          isMust: act.isMust,
          minutes: act.minutes || 15,
          owner: act.owner || "Moi",
          completed: false,
        });
      }
      return NextResponse.json(cloned);
    }

    // Mode Création Standard
    const blockId = crypto.randomUUID();
    const [newBlock] = await db
      .insert(rpmBlocks)
      .values({
        id: blockId,
        areaId: body.areaId || null,
        result: body.result,
        purpose: body.purpose || "",
        weekStart: body.weekStart || "current",
        status: "active",
      })
      .returning();

    if (body.actionsList && Array.isArray(body.actionsList)) {
      for (const act of body.actionsList) {
        if (act.content?.trim()) {
          await db.insert(actions).values({
            id: crypto.randomUUID(),
            blockId,
            content: act.content,
            isMust: Boolean(act.isMust),
            minutes: Number(act.minutes) || 15,
            owner: act.owner || "Moi",
            completed: false,
          });
        }
      }
    }

    return NextResponse.json(newBlock);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur création bloc" }, { status: 500 });
  }
}
