import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const update: Partial<typeof actions.$inferInsert> = {};
    if (typeof body.content === "string") update.content = body.content;
    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.minutes === "number" && Number.isFinite(body.minutes) && body.minutes > 0) update.minutes = body.minutes;
    if (typeof body.isMust === "boolean") update.isMust = body.isMust;
    if (typeof body.priority === "number" && Number.isInteger(body.priority)) update.priority = body.priority;
    if (typeof body.blockId === "string") update.blockId = body.blockId;
    const done = typeof body.completed === "boolean" ? body.completed : body.isDone;
    if (typeof done === "boolean") {
      update.completed = done;
      update.isDone = done;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Aucune modification valide" }, { status: 400 });
    }
    const [updated] = await db.update(actions).set(update).where(eq(actions.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Action introuvable" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur modification action" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(actions).where(eq(actions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression action" }, { status: 500 });
  }
}
