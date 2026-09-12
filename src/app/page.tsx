import { db } from "@/db";
import { rpmBlocks, actions, areas, roles, captures } from "@/db/schema";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const res = await Promise.all([
      db.select().from(areas),
      db.select().from(rpmBlocks),
      db.select().from(actions),
      db.select().from(roles),
      db.select().from(captures),
    ]);

    const areasData = res[0] || [];
    const blocksData = res[1] || [];
    const actionsData = res[2] || [];
    const rolesData = res[3] || [];
    const capturesData = res[4] || [];

    const formattedBlocks = blocksData.map((block) => ({
      ...block,
      actions: actionsData.filter((action) => action.blockId === block.id),
    }));

    const actionsCount = actionsData.length;
    const completedActionsCount = actionsData.filter((a) => a.completed).length;
    const weekProgress = actionsCount > 0 ? Math.round((completedActionsCount / actionsCount) * 100) : 0;

    const stats = {
      actionsCount,
      mustActionsCount: actionsData.filter((a) => a.priority === 1).length,
      blocksCount: blocksData.length,
      activeAreasCount: areasData.length,
      completedActionsCount,
      totalMustMin: 0,
      doneCount: completedActionsCount,
      weekProgress,
      inboxCount: capturesData.filter((c) => !c.processed).length,
      mustCount: actionsData.filter((a) => a.priority === 1).length,
      totalCount: actionsCount,
      mustDone: actionsData.filter((a) => a.priority === 1 && a.completed).length,
      mustMinLeft: 0,
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
        stats={stats as any}
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
          totalMustMin: 0,
          doneCount: 0,
          weekProgress: 0,
          inboxCount: 0,
          mustCount: 0,
          totalCount: 0,
          mustDone: 0,
          mustMinLeft: 0,
        } as any}
      />
    );
  }
        }
  
