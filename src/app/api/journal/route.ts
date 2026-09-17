import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get("date");

    const entries = await db.select().from(journalEntries);

    if (dateQuery) {
      const filtered = entries.filter((e) => e.date === dateQuery);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lecture journal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dateStr = body.date || new Date().toISOString().split("T")[0];

    const contentPayload = JSON.stringify({
      gratitudes: body.gratitudes || ["", "", ""],
      victories: body.victories || "",
      reflections: body.reflections || "",
      scoreDay: body.scoreDay || 8,
    });

    const existing = await db.select().from(journalEntries).where(eq(journalEntries.date, dateStr));

    if (existing.length > 0) {
      await db
        .update(journalEntries)
        .set({ content: contentPayload })
        .where(eq(journalEntries.id, existing[0].id));
      return NextResponse.json({ success: true, id: existing[0].id });
    }

    const created = await db
      .insert(journalEntries)
      .values({
        id: crypto.randomUUID(),
        date: dateStr,
        content: contentPayload,
      })
      .returning();

    return NextResponse.json(created[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erreur enregistrement journal" }, { status: 500 });
  }
}
