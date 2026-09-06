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
