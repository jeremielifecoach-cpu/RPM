export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newBlock = await db.insert(rpmBlocks).values(body).returning();
    return NextResponse.json(newBlock[0]);
  } catch (error) {
    console.error("Erreur création bloc:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du bloc" },
      { status: 500 }
    );
  }
}
