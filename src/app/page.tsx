import { db } from "@/db";
import { rpmBlocks, actions, areas, roles, captures } from "@/db/schema";
import { DashboardClient } from "@/components/dashboard-client";
import { ensureAreasSeeded } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  try {
    // S'assurer que les domaines de base existent dans la base Neon
    await ensureAreasSeeded();

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
    const capturesData = res[4] || [];

    const formattedBlocks = blocksData.map((block) => {
      const blockActions = actionsData.filter((a) => a.blockId === block.id);
      const doneCount = blockActions.filter((a) => a.isDone || a.completed).length;
      const totalCount = blockActions.length;
      const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      const mustLeft = blockActions.filter((a) => a.isMust && !a.isDone).length;

      return {
        ...block,
        actions: blockActions,
        area: areasData.find((a) => a.id === block.areaId) || null,
        role: null,
        doneCount,
        totalCount,
        progress,
        mustLeft,
      };
    });

    const activeBlocks = formattedBlocks.filter((b) => b.status === "active").length;
    const totalCount = actionsData.length;
    const doneCount = actionsData.filter((a) => a.isDone || a.completed).length;
    const weekProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const musts = actionsData.filter((a) => a.isMust);
    const mustDone = musts.filter((a) => a.isDone || a.completed).length;
    const momentsTotal = actionsData
      .filter((a) => !a.isDone && !a.completed)
      .reduce((acc, curr) => acc + (curr.minutes || 15), 0);

    const stats = {
      totalMustMin: 0,
      doneCount,
      weekProgress,
      inboxCount: capturesData.filter((c) => c.status !== "processed" && !c.processed).length,
      activeBlocks,
      totalBlocks: blocksData.length,
      mustDone,
      mustTotal: musts.length,
      momentsTotal,
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
          totalMustMin: 0,
          doneCount: 0,
          weekProgress: 0,
          inboxCount: 0,
          activeBlocks: 0,
          totalBlocks: 0,
          mustDone: 0,
          mustTotal: 0,
          momentsTotal: 0,
        }}
      />
    );
  }
}
