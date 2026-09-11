import { db } from "@/db";
import { lifeVisionDomains, quarterlyMilestones, areas as areasTable } from "@/db/schema";
import { VisionClient } from "@/components/vision-client";

export default async function VisionPage() {
  const [domains, milestones, areas] = await Promise.all([
    db.select().from(lifeVisionDomains),
    db.select().from(quarterlyMilestones),
    db.select().from(areasTable),
  ]);

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
