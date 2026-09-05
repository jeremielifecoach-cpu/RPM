import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
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
