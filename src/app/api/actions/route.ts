import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const { blockId, content, isMust, dayOfWeek } = body;

  if (!blockId || !content) {
    return NextResponse.json(
      { error: "blockId et content sont requis" },
      { status: 400 }
    );
  }

  const [newAction] = await db
    .insert(actions)
    .values({
      blockId,
      content,
      isMust: isMust || false,
      isDone: false,
      dayOfWeek: dayOfWeek || null,
    })
    .returning();

  return NextResponse.json(newAction, { status: 201 });
}
