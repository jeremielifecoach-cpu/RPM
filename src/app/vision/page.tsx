export const dynamic = "force-dynamic";

import { db } from "@/db";
import { lifeVisionDomains, quarterlyMilestones, areas as areasTable } from "@/db/schema";
import { VisionClient } from "@/components/vision-client";

export default async function VisionPage() {
  let domains: any[] = [];
  let milestones: any[] = [];
  let areas: any[] = [];

  try {
    const res = await Promise.all([
      db.select().from(lifeVisionDomains),
      db.select().from(quarterlyMilestones),
      db.select().from(areasTable),
    ]);
    domains = res[0] || [];
    milestones = res[1] || [];
    areas = res[2] || [];
  } catch (error) {
    console.warn("Erreur chargement VisionPage:", error);
  }

  const formattedDomains = domains.map((domain) => {
    const domainMilestones = milestones.filter((m) => m.domainId === domain.id);
    const milestonesMap: Record<string, string> = {};
    domainMilestones.forEach((m) => {
      if (m.quarter && m.targetOutcome) {
        milestonesMap[m.quarter] = m.targetOutcome;
      }
    });

    return {
      ...domain,
      milestones: milestonesMap,
    };
  });

  return (
    <VisionClient
      initialDomains={formattedDomains as any}
      initialMilestones={milestones as any}
      areas={areas as any}
    />
  );
}
