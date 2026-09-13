import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { getJournal } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getJournal();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lecture journal" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await db
      .insert(journalEntries)
      .values({
        id: crypto.randomUUID(),
        content: body.content,
      })
      .returning();
    return NextResponse.json(created[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erreur ecriture journal" }, { status: 500 });
  }
}
