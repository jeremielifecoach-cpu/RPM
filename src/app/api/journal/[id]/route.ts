import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
  return NextResponse.json({ ok: true });
}
