import { NextResponse } from "next/server";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(roles).orderBy(asc(roles.position));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rôles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, color, position } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom du rôle est requis" },
        { status: 400 }
      );
    }

    const roleId = `role_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const [row] = await db
      .insert(roles)
      .values({
        id: roleId,
        name,
        description: String(description || ""),
        color: color || "amber",
        position: position ?? 0,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création du rôle" },
      { status: 500 }
    );
  }
}
