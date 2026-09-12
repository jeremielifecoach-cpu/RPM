export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { roles } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRole = await db.insert(roles).values(body).returning();
    return NextResponse.json(newRole[0]);
  } catch (error) {
    console.error("Erreur création rôle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du rôle" },
      { status: 500 }
    );
  }
}
