import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { todayISO } from "@/lib/date";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wins, gratitude, lessons, energyScore, date } = body;

    const journalId = `journal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [row] = await db
      .insert(journalEntries)
      .values({
        id: journalId,
        date: String(date || todayISO()),
        wins: wins || "",
        gratitude: gratitude || "",
        lessons: lessons || "",
        energyScore: energyScore ?? 5,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entrée de journal" },
      { status: 500 }
    );
  }
}
