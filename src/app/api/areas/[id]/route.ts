import { NextResponse } from "next/server";
import { db } from "@/db";
import { areas } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {};
    if (body.score !== undefined) updateData.score = Number(body.score);
    if (body.isPriority !== undefined) updateData.isPriority = Boolean(body.isPriority);
    if (body.name !== undefined) updateData.name = body.name;
    if (body.focus !== undefined) updateData.focus = body.focus;

    const updated = await db
      .update(areas)
      .set(updateData)
      .where(eq(areas.id, id))
      .returning();

    return NextResponse.json(updated[0] || { id, ...updateData });
  } catch (error) {
    console.error("Erreur API Areas PATCH:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du domaine" },
      { status: 500 }
    );
  }
}
