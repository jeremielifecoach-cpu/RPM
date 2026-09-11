import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks, actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await db
      .update(rpmBlocks)
      .set(body)
      .where(eq(rpmBlocks.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du bloc" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Supprimer d'abord les actions rattachées au bloc
    await db.delete(actions).where(eq(actions.blockId, id));

    // 2. Supprimer le bloc
    await db.delete(rpmBlocks).where(eq(rpmBlocks.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du bloc" },
      { status: 500 }
    );
  }
}
