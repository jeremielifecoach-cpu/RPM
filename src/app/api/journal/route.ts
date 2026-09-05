import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { todayISO } from "@/lib/date";

export async function POST(req: Request) {
  const body = await req.json();
  const content = String(body?.content ?? "").trim();
  if (!content)
    return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
  const type = ["gratitude", "victoire", "reflexion"].includes(body?.type)
    ? body.type
    : "gratitude";
  const [row] = await db
    .insert(journalEntries)
    .values({
      content,
      type,
      date: String(body?.date ?? todayISO()),
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
