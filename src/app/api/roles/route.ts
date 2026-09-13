import { NextResponse } from "next/server";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { getRoles } from "@/lib/data";

export async function GET() {
  try {
    const data = await getRoles();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur rôles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    const created = await db
      .insert(roles)
      .values({ id: crypto.randomUUID(), name, description })
      .returning();
    return NextResponse.json(created[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erreur création rôle" }, { status: 500 });
  }
}
