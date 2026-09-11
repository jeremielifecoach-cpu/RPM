import { NextResponse } from "next/server";
import { db } from "@/db";
import { areas } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(areas).orderBy(asc(areas.position));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des domaines" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, icon, color, score, position } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Le nom et le slug sont requis" },
        { status: 400 }
      );
    }

    const areaId = `area_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [row] = await db
      .insert(areas)
      .values({
        id: areaId,
        name,
        slug,
        icon: icon || "🎯",
        color: color || "amber",
        score: score ?? 5,
        position: position ?? 0,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création du domaine" },
      { status: 500 }
    );
  }
}
