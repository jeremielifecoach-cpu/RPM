import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks } from "@/db/schema";
import { weekKeyOf } from "@/lib/date";

export async function POST(req: Request) {
  const body = await req.json();
  const result = String(body?.result ?? "").trim();
  if (!result)
    return NextResponse.json({ error: "Résultat requis" }, { status: 400 });
  const weekStart = String(body?.weekStart ?? weekKeyOf(new Date()));
  const [row] = await db
    .insert(rpmBlocks)
    .values({
      result,
      purpose: String(body?.purpose ?? ""),
      areaId: body.areaId || null,
      roleId: body.roleId || null,
      status: "active",
      weekStart,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
