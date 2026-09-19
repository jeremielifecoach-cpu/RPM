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
    await db.update(rpmBlocks).set(body).where(eq(rpmBlocks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur modification bloc" }, { status: 500 });
  }
}
