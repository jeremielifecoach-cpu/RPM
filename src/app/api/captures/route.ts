import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const content = String(body?.content ?? "").trim();
  if (!content)
    return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
  const [row] = await db
    .insert(captures)
    .values({
      content,
      areaId: body.areaId || null,
      status: "inbox",
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
