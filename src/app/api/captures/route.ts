export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newCapture = await db.insert(captures).values(body).returning();
    return NextResponse.json(newCapture[0]);
  } catch (error) {
    console.error("Erreur création capture:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la capture" },
      { status: 500 }
    );
  }
}
