export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { areas } from "@/db/schema";

export async function GET() {
  try {
    const data = await db.select().from(areas);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur GET /api/areas:", error);
    return NextResponse.json([], { status: 500 });
  }
}
