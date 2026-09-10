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

  const patch: Partial<typeof rpmBlocks.$inferInsert> = {};
  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.result === "string") patch.result = body.result;
  if (typeof body.purpose === "string") patch.purpose = body.purpose;

  const [updated] = await db
    .update(rpmBlocks)
    .set(patch)
    .where(eq(rpmBlocks.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Bloc introuvable" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
