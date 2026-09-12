export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newAction = await db.insert(actions).values(body).returning();
    return NextResponse.json(newAction[0]);
  } catch (error) {
    console.error("Erreur création action:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'action" },
      { status: 500 }
    );
  }
}

