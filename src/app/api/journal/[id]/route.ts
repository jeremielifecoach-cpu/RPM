export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression journal:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du journal" },
      { status: 500 }
    );
  }
}
