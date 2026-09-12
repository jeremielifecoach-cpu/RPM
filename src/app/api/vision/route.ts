export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { visionTable } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newVision = await db.insert(visionTable).values(body).returning();
    return NextResponse.json(newVision[0]);
  } catch (error) {
    console.error("Erreur création vision:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la vision" },
      { status: 500 }
    );
  }
}
