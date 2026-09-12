export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { valuesTable } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newValue = await db.insert(valuesTable).values(body).returning();
    return NextResponse.json(newValue[0]);
  } catch (error) {
    console.error("Erreur création valeur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la valeur" },
      { status: 500 }
    );
  }
}
