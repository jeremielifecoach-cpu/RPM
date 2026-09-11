import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    if (all === "true") {
      const allBlocks = await db.select().from(rpmBlocks);
      return NextResponse.json(allBlocks);
    }

    const blocks = await db
      .select()
      .from(rpmBlocks)
      .where(eq(rpmBlocks.status, "active"));

    return NextResponse.json(blocks);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des blocs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { result, title, purpose, areaId, roleId, weekStart } = body;

    const blockId = `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [newBlock] = await db
      .insert(rpmBlocks)
      .values({
        id: blockId,
        result: result || title || "Nouveau bloc",
        purpose: purpose || "",
        areaId: areaId || null,
        roleId: roleId || null,
        status: "active",
        weekStart: weekStart || new Date().toISOString().slice(0, 10),
      })
      .returning();

    return NextResponse.json(newBlock, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création du bloc" },
      { status: 500 }
    );
  }
}
