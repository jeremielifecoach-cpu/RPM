import { NextResponse } from "next/server";
import { db } from "@/db";
import { areas } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(areas).orderBy(asc(areas.position));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  const slug =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);
  const [row] = await db
    .insert(areas)
    .values({
      name,
      slug,
      icon: body.icon || "star",
      color: body.color || "#F5B93C",
      score: 5,
      position: body.position ?? Date.now() % 100000,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
