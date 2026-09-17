import { NextResponse } from "next/server";
import { db } from "@/db";
import { areas } from "@/db/schema";
import { getAreas, ensureAreasSeeded } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await ensureAreasSeeded();
    const data = await getAreas();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur chargement domaines" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newArea = await db
      .insert(areas)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        focus: body.focus || "",
        score: Number(body.score) || 5,
      })
      .returning();
    return NextResponse.json(newArea[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erreur création domaine" }, { status: 500 });
  }
}
