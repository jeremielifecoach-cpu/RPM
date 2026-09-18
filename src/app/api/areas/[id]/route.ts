import { NextResponse } from "next/server";
import { db } from "@/db";
import { areas, rpmBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Délie les blocs RPM rattachés pour autoriser la suppression du domaine
    await db.update(rpmBlocks).set({ areaId: null }).where(eq(rpmBlocks.areaId, id));
    await db.delete(areas).where(eq(areas.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression domaine :", error);
    return NextResponse.json({ error: "Erreur suppression domaine" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Inscription stricte des champs valides en base SQL
    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.focus !== undefined) updateData.focus = body.focus;
    if (body.score !== undefined) updateData.score = Number(body.score);

    await db.update(areas).set(updateData).where(eq(areas.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur MAJ domaine :", error);
    return NextResponse.json({ error: "Erreur mise à jour domaine" }, { status: 500 });
  }
}
