import { NextResponse } from "next/server";
import { db } from "@/db";
import { lifeVisionDomains, quarterlyMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";

// Récupérer la Vision CEO et les Jalons Trimestriels
export async function GET() {
  try {
    const domains = await db.select().from(lifeVisionDomains);
    const milestones = await db.select().from(quarterlyMilestones);

    return NextResponse.json({ domains, milestones });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la vision CEO" },
      { status: 500 }
    );
  }
}

// Créer ou mettre à jour un Domaine des 7 Magnifiques
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      areaId,
      title,
      vision,
      mission,
      values,
      drivers,
      resources,
      yearOutcome,
      milestones,
    } = body;

    const domainId = id || `domain_${Date.now()}`;

    // 1. Sauvegarder ou Mettre à jour le domaine
    if (id) {
      await db
        .update(lifeVisionDomains)
        .set({
          areaId: areaId || null,
          title: title || "Nouveau Domaine Prioritaire",
          vision: vision || "",
          mission: mission || "",
          values: values || "",
          drivers: drivers || "",
          resources: resources || "",
          yearOutcome: yearOutcome || "",
        })
        .where(eq(lifeVisionDomains.id, id));
    } else {
      await db.insert(lifeVisionDomains).values({
        id: domainId,
        areaId: areaId || null,
        title: title || "Nouveau Domaine Prioritaire",
        vision: vision || "",
        mission: mission || "",
        values: values || "",
        drivers: drivers || "",
        resources: resources || "",
        yearOutcome: yearOutcome || "",
      });
    }

    // 2. Gestion des Jalons Trimestriels (Q1..Q4)
    if (milestones && Array.isArray(milestones)) {
      for (const m of milestones) {
        const milestoneId = m.id || `m_${domainId}_${m.quarter}`;
        
        // Supprimer l'ancien jalon s'il existe puis insérer le nouveau
        await db
          .delete(quarterlyMilestones)
          .where(eq(quarterlyMilestones.id, milestoneId));

        await db.insert(quarterlyMilestones).values({
          id: milestoneId,
          domainId: domainId,
          quarter: m.quarter,
          year: m.year || 2026,
          targetOutcome: m.targetOutcome || "",
          isCurrent: m.isCurrent || false,
        });
      }
    }

    return NextResponse.json({ success: true, domainId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde stratégique" },
      { status: 500 }
    );
  }
}
