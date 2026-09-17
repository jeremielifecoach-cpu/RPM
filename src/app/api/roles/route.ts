import { NextResponse } from "next/server";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await db.select().from(roles);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur chargement rôles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roleId = body.id || crypto.randomUUID();

    const payload = {
      name: body.name || "Nouveau Rôle",
      description: typeof body.details === "object" ? JSON.stringify(body.details) : body.description || "",
    };

    const existing = await db.select().from(roles).where(eq(roles.id, roleId));

    if (existing.length > 0) {
      await db.update(roles).set(payload).where(eq(roles.id, roleId));
      return NextResponse.json({ success: true, id: roleId });
    }

    const created = await db.insert(roles).values({ id: roleId, ...payload }).returning();
    return NextResponse.json(created[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erreur sauvegarde rôle" }, { status: 500 });
  }
}
