import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Le contenu est requis" },
        { status: 400 }
      );
    }

    const captureId = `cap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [row] = await db
      .insert(captures)
      .values({
        id: captureId,
        content,
        status: "inbox",
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création de la capture" },
      { status: 500 }
    );
  }
}
