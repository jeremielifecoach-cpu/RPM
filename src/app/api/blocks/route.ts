import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showAll = searchParams.get("all") === "true";
  const weekStart = searchParams.get("weekStart");

  if (showAll || !weekStart) {
    const allBlocks = await db.select().from(rpmBlocks);
    return NextResponse.json(allBlocks);
  }

  const blocks = await db
    .select()
    .from(rpmBlocks)
    .where(eq(rpmBlocks.weekStart, weekStart));

  return NextResponse.json(blocks);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, result, purpose, areaId, roleId, weekStart } = body;

  const [newBlock] = await db
    .insert(rpmBlocks)
    .values({
      result: result || title || "Nouveau bloc",
      purpose: purpose || "",
      areaId: areaId || null,
      roleId: roleId || null,
      weekStart: weekStart || new Date().toISOString().slice(0, 10),
    })
    .returning();

  return NextResponse.json(newBlock, { status: 201 });
}
