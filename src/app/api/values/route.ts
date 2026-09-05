import { NextResponse } from "next/server";
import { db } from "@/db";
import { valuesTable } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(valuesTable).orderBy(asc(valuesTable.position));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  const [row] = await db
    .insert(valuesTable)
    .values({ name, position: Date.now() % 100000 })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
