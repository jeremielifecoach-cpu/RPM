import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const blockId = String(body?.blockId ?? "");
  const content = String(body?.content ?? "").trim();
  if (!blockId || !content)
    return NextResponse.json(
      { error: "Bloc et contenu requis" },
      { status: 400 }
    );
  const [row] = await db
    .insert(actions)
    .values({
      blockId,
      content,
      isMust: Boolean(body?.isMust),
      minutes: Number(body?.minutes) || 15,
      position: Date.now() % 1000000,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
