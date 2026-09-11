import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blockId, content, isMust, dayOfWeek } = body;

    if (!blockId || !content) {
      return NextResponse.json(
        { error: "blockId et content sont requis" },
        { status: 400 }
      );
    }

    const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [newAction] = await db
      .insert(actions)
      .values({
        id: actionId,
        blockId,
        content,
        isMust: isMust || false,
        isDone: false,
        dayOfWeek: dayOfWeek || null,
      })
      .returning();

    return NextResponse.json(newAction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'action" },
      { status: 500 }
    );
  }
}
