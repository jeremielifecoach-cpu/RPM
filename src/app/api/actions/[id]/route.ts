export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(actions).where(eq(actions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression action:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'action" },
      { status: 500 }
    );
  }
}
