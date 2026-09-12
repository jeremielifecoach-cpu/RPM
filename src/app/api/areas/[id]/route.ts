export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { areas } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, any> = {};
    if (body.score !== undefined) updateData.score = Number(body.score);
    if (body.focus !== undefined) updateData.focus = body.focus;

    const updated = await db
      .update(areas)
      .set(updateData)
      .where(eq(areas.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Erreur mise à jour area:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
