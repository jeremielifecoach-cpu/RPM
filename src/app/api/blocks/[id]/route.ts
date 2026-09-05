import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const patch: Partial<typeof rpmBlocks.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };
  if (typeof body.result === "string" && body.result.trim())
    patch.result = body.result.trim();
  if (typeof body.purpose === "string") patch.purpose = body.purpose;
  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.weekStart === "string" && body.weekStart)
    patch.weekStart = body.weekStart;
  if ("areaId" in body) patch.areaId = body.areaId || null;
  if ("roleId" in body) patch.roleId = body.roleId || null;
  const [row] = await db
    .update(rpmBlocks)
    .set(patch)
    .where(eq(rpmBlocks.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(rpmBlocks).where(eq(rpmBlocks.id, id));
  return NextResponse.json({ ok: true });
}
