import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const patch: Partial<typeof actions.$inferInsert> = {};
  if (typeof body.content === "string" && body.content.trim())
    patch.content = body.content.trim();
  if (typeof body.isMust === "boolean") patch.isMust = body.isMust;
  if (typeof body.isDone === "boolean") patch.isDone = body.isDone;
  if (typeof body.minutes === "number")
    patch.minutes = Math.max(0, Math.round(body.minutes));
  const [row] = await db
    .update(actions)
    .set(patch)
    .where(eq(actions.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(actions).where(eq(actions.id, id));
  return NextResponse.json({ ok: true });
}
