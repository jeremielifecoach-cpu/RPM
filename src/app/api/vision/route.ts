export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { lifeVisionDomains, quarterlyMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const domainId = body.id || crypto.randomUUID();

    // 1. Sauvegarder ou mettre à jour le domaine
    const existing = await db
      .select()
      .from(lifeVisionDomains)
      .where(eq(lifeVisionDomains.id, domainId));

    if (existing.length > 0) {
      await db
        .update(lifeVisionDomains)
        .set({
          title: body.title || "Domaine",
          description: body.vision || body.mission || "",
        })
        .where(eq(lifeVisionDomains.id, domainId));
    } else {
      await db.insert(lifeVisionDomains).values({
        id: domainId,
        title: body.title || "Domaine",
        description: body.vision || body.mission || "",
      });
    }

    // 2. Traiter les jalons trimestriels
    if (Array.isArray(body.milestones)) {
      for (const m of body.milestones) {
        await db.insert(quarterlyMilestones).values({
          id: crypto.randomUUID(),
          domainId,
          quarter: m.quarter,
          targetOutcome: m.targetOutcome || "",
        });
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
