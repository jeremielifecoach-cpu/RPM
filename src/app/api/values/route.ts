import { NextResponse } from "next/server";
import { db } from "@/db";
import { valuesTable } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(valuesTable)
      .orderBy(asc(valuesTable.rank));
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des valeurs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, rank } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Le titre de la valeur est requis" },
        { status: 400 }
      );
    }

    const valueId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [row] = await db
      .insert(valuesTable)
      .values({
        id: valueId,
        title,
        description: description || "",
        rank: rank ?? 1,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création de la valeur" },
      { status: 500 }
    );
  }
}
