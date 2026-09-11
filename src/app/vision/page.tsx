export const dynamic = "force-dynamic";

import { db } from "@/db";
import { lifeVisionDomains, quarterlyMilestones, areas as areasTable } from "@/db/schema";
import { VisionClient } from "@/components/vision-client";

export default async function VisionPage() {
  let domains: typeof lifeVisionDomains.$inferSelect[] = [];
  let milestones: typeof quarterlyMilestones.$inferSelect[] = [];
  let areas: typeof areasTable.$inferSelect[] = [];

  try {
    const res = await Promise.all([
      db.select().from(lifeVisionDomains),
      db.select().from(quarterlyMilestones),
      db.select().from(areasTable),
    ]);
    domains = res[0];
    milestones = res[1];
    areas = res[2];
  } catch (error) {
    console.warn("Tables vision/milestones introuvables lors du chargement de la page Vision:", error);
  }

  // Formater les domaines avec leurs jalons respectifs
  const formattedDomains = domains.map((domain) => {
    const domainMilestones = milestones.filter((m) => m.domainId === domain.id);
    const milestonesMap: Record<string, string> = {};
    domainMilestones.forEach((m) => {
      milestonesMap[m.quarter] = m.targetOutcome;
    });

    return {
      ...domain,
      milestones: milestonesMap,
    };
  });

  return (
    <VisionClient
      initialDomains={formattedDomains}
      initialMilestones={milestones}
      areas={areas}
    />
  );
}
