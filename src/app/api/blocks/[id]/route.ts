import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks, actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(actions).where(eq(actions.blockId, id));
    await db.delete(rpmBlocks).where(eq(rpmBlocks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression bloc" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, any> = {};
    if (body.result !== undefined) updateData.result = body.result;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.weekStart !== undefined) updateData.weekStart = body.weekStart;
    if (body.areaId !== undefined) updateData.areaId = body.areaId ? body.areaId : null;

    await db.update(rpmBlocks).set(updateData).where(eq(rpmBlocks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur modification bloc :", error);
    return NextResponse.json({ error: "Erreur modification bloc" }, { status: 500 });
  }
}
