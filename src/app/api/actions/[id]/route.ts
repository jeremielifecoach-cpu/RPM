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
  if (typeof body.isDone === "boolean") patch.isDone = body.isDone;
  if (typeof body.content === "string") patch.content = body.content;
  if (typeof body.isMust === "boolean") patch.isMust = body.isMust;

  const [updated] = await db
    .update(actions)
    .set(patch)
    .where(eq(actions.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Action introuvable" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
