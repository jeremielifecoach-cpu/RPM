import { NextResponse } from "next/server";
import { db } from "@/db";
import { areas } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const patch: Partial<typeof areas.$inferInsert> = {};
  if (typeof body.score === "number")
    patch.score = Math.max(0, Math.min(10, Math.round(body.score)));
  if (typeof body.name === "string" && body.name.trim())
    patch.name = body.name.trim();
  if (typeof body.focus === "string") patch.focus = body.focus;
  if (typeof body.color === "string") patch.color = body.color;
  if (typeof body.icon === "string") patch.icon = body.icon;
  const [row] = await db.update(areas).set(patch).where(eq(areas.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(areas).where(eq(areas.id, id));
  return NextResponse.json({ ok: true });
}
