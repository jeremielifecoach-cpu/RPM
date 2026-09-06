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

  // Si on demande de rattacher directement la capture à un bloc RPM existant
  if (body.targetBlockId && body.attachType) {
    const { targetBlockId, attachType, content, dayOfWeek, actionDate } = body;
    const textContent = content || body.content;

    if (attachType === "action") {
      // 1. Ajouter une action au bloc RPM existant
      await db.insert(actions).values({
        blockId: targetBlockId,
        content: textContent,
        isMust: body.isMust || false,
        isDone: false,
        dayOfWeek: dayOfWeek || null,
        actionDate: actionDate || null,
      });
    } else if (attachType === "result") {
      // 2. Mettre à jour le Résultat du bloc RPM
      await db
        .update(rpmBlocks)
        .set({ result: textContent, updatedAt: new Date() })
        .where(eq(rpmBlocks.id, targetBlockId));
    } else if (attachType === "purpose") {
      // 3. Mettre à jour le Pourquoi du bloc RPM
      await db
        .update(rpmBlocks)
        .set({ purpose: textContent, updatedAt: new Date() })
        .where(eq(rpmBlocks.id, targetBlockId));
    }

    // Marquer la capture comme traitée
    const [row] = await db
      .update(captures)
      .set({ status: "processed" })
      .where(eq(captures.id, id))
      .returning();

    return NextResponse.json({ ok: true, capture: row });
  }

  // Mettre à jour le contenu ou le statut de la capture de manière classique
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(captures).where(eq(captures.id, id));
  return NextResponse.json({ ok: true });
}
