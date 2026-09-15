import { NextResponse } from "next/server";
import { db } from "@/db";
import { lifeVisionDomains, quarterlyMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const domains = await db.select().from(lifeVisionDomains);
    const milestones = await db.select().from(quarterlyMilestones);

    const data = domains.map((domain) => ({
      ...domain,
      milestones: milestones.filter((m) => m.domainId === domain.id),
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lecture vision" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const domainId = body.id || crypto.randomUUID();

    const descriptionContent =
      typeof body.details === "object"
        ? JSON.stringify(body.details)
        : body.description || body.vision || "";

    const existing = await db
      .select()
      .from(lifeVisionDomains)
      .where(eq(lifeVisionDomains.id, domainId));

    if (existing.length > 0) {
      await db
        .update(lifeVisionDomains)
        .set({
          title: body.title || "Domaine",
          description: descriptionContent,
        })
        .where(eq(lifeVisionDomains.id, domainId));
    } else {
      await db.insert(lifeVisionDomains).values({
        id: domainId,
        title: body.title || "Domaine",
        description: descriptionContent,
      });
    }

    return NextResponse.json({ success: true, id: domainId });
  } catch (error) {
    return NextResponse.json({ error: "Erreur sauvegarde vision" }, { status: 500 });
  }
}
