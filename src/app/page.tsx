import { db } from "@/db";
import { rpmBlocks, actions, areas, roles } from "@/db/schema";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const res = await Promise.all([
      db.select().from(areas),
      db.select().from(rpmBlocks),
      db.select().from(actions),
      db.select().from(roles),
    ]);

    const areasData = res[0] || [];
    const blocksData = res[1] || [];
    const actionsData = res[2] || [];
    const rolesData = res[3] || [];

    const formattedBlocks = blocksData.map((block) => ({
      ...block,
      actions: actionsData.filter((action) => action.blockId === block.id),
    }));

    const stats = {
      actionsCount: actionsData.length,
      mustActionsCount: actionsData.filter((a) => a.priority === 1).length,
      blocksCount: blocksData.length,
      activeAreasCount: areasData.length,
      completedActionsCount: actionsData.filter((a) => a.completed).length,
    };

    const today = new Date();
    const todayLabel = today.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return (
      <DashboardClient
        weekKey="current"
        weekLabel="Semaine en cours"
        todayLabel={todayLabel}
        areas={areasData as any}
        blocks={formattedBlocks as any}
        stats={stats}
      />
    );
  } catch (error) {
    console.error("Erreur chargement Dashboard:", error);
    return (
      <DashboardClient
        weekKey=""
        weekLabel=""
        todayLabel=""
        areas={[]}
        blocks={[]}
        stats={{
          actionsCount: 0,
          mustActionsCount: 0,
          blocksCount: 0,
          activeAreasCount: 0,
          completedActionsCount: 0,
        }}
      />
    );
  }
}
