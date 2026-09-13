import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures } from "@/db/schema";
import { getCaptures } from "@/lib/data";

export async function GET() {
  try {
    const data = await getCaptures();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du chargement des captures" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const created = await db
      .insert(captures)
      .values({ content })
      .returning();
    return NextResponse.json(created[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création de la capture" },
      { status: 500 }
    );
  }
}
