import { DashboardClient } from "@/components/dashboard-client";
import { db } from "@/db";
import { rpmBlocks, actions } from "@/db/schema";
import { getAreas, ensureAreasSeeded } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  await ensureAreasSeeded();
  const areasData = await getAreas();
  const blocksData = await db.select().from(rpmBlocks);
  const actionsData = await db.select().from(actions);

  const fullBlocks = blocksData.map((b) => ({
    ...b,
    actions: actionsData.filter((a) => a.blockId === b.id),
  }));

  const activeBlocks = fullBlocks.length;
  const totalActions = actionsData.length;
  const completedActions = actionsData.filter((a) => a.completed).length;

  const mustActionsList = actionsData.filter((a) => a.isMust);
  const mustActions = mustActionsList.length;
  const mustCompleted = mustActionsList.filter((a) => a.completed).length;

  const uncompletedActions = actionsData.filter((a) => !a.completed);
  const remainingMinutes = uncompletedActions.reduce((acc, a) => acc + (a.minutes || 15), 0);
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  const stats = {
    // Blocs actifs
    activeBlocks,
    totalBlocks: activeBlocks,
    activeBlocksCount: activeBlocks,

    // Actions
    totalActions,
    completedActions,

    // MUST
    mustActions,
    mustTotal: mustActions,
    mustCompleted,
    mustDone: mustCompleted,

    // Élan de semaine / Taux
    completionRate,
    completionPercentage: completionRate,
    elan: completionRate,
    momentum: completionRate,

    // Temps restant (évite le NaNhNaN)
    remainingMinutes,
    totalRemainingMinutes: remainingMinutes,
    remainingHours: Math.floor(remainingMinutes / 60),
    remainingMins: remainingMinutes % 60,
  };

  const now = new Date();
  const todayLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardClient
      weekKey="current"
      weekLabel="Semaine en cours"
      todayLabel={todayLabel}
      areas={areasData}
      blocks={fullBlocks as any}
      stats={stats as any}
    />
  );
      }
