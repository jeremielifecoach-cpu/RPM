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

    const updated = await db
      .update(areas)
      .set(body)
      .where(eq(areas.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Erreur mise à jour domaine:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du domaine" },
      { status: 500 }
    );
  }
}

