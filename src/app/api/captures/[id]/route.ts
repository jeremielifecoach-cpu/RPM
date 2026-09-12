export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(captures).where(eq(captures.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression capture:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la capture" },
      { status: 500 }
    );
  }
}
