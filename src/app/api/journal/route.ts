export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newEntry = await db.insert(journalEntries).values(body).returning();
    return NextResponse.json(newEntry[0]);
  } catch (error) {
    console.error("Erreur création journal:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entrée journal" },
      { status: 500 }
    );
  }
}
