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
    console.error("Erreur chargement Vision:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de la vision" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const domainId = body.id || crypto.randomUUID();

    // Sérialiser les champs des 7 Magnifiques dans la description si nécessaire
    const descriptionContent =
      typeof body.details === "object"
        ? JSON.stringify(body.details)
        : body.description || body.vision || body.mission || "";

    // 1. Sauvegarder ou mettre à jour le domaine de vision
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

    // 2. Mettre à jour les jalons trimestriels
    if (Array.isArray(body.milestones)) {
      await db
        .delete(quarterlyMilestones)
        .where(eq(quarterlyMilestones.domainId, domainId));

      for (const m of body.milestones) {
        if (m.targetOutcome?.trim()) {
          await db.insert(quarterlyMilestones).values({
            id: crypto.randomUUID(),
            domainId,
            quarter: m.quarter || "Q1",
            targetOutcome: m.targetOutcome.trim(),
          });
        }
      }
    }

    return NextResponse.json({ success: true, id: domainId });
  } catch (error) {
    console.error("Erreur enregistrement Vision:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde de la vision" },
      { status: 500 }
    );
  }
}
