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

  // 1. Récupérer le bloc existant
  const [sourceBlock] = await db
    .select()
    .from(rpmBlocks)
    .where(eq(rpmBlocks.id, id));

  if (!sourceBlock) {
    return NextResponse.json({ error: "Bloc introuvable" }, { status: 404 });
  }

  // 2. Calculer la date de la semaine suivante
  const nextWeek = addWeeks(sourceBlock.weekStart, 1);

  // 3. Créer le nouveau bloc marqué comme suite/continuité
  const newResult = sourceBlock.result.includes("[Suite]")
    ? sourceBlock.result
    : `[Suite] ${sourceBlock.result}`;

  const [newBlock] = await db
    .insert(rpmBlocks)
    .values({
      result: newResult,
      purpose: sourceBlock.purpose,
      areaId: sourceBlock.areaId,
      roleId: sourceBlock.roleId,
      status: "active",
      weekStart: nextWeek,
    })
    .returning();

  // 4. Copier les actions (en priorité celles non terminées)
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
        isDone: false, // Réinitialisé pour la nouvelle semaine
        minutes: a.minutes,
        position: a.position,
        dayOfWeek: a.dayOfWeek || null,
      }))
    );
  }

  return NextResponse.json(newBlock, { status: 201 });
}
