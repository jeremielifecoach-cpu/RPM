export const dynamic = "force-dynamic";

import { db } from "@/db";
import { rpmBlocks, actions, areas, roles, captures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";

export default async function HomePage() {
  let rawBlocks: typeof rpmBlocks.$inferSelect[] = [];
  let allActions: typeof actions.$inferSelect[] = [];
  let areaList: typeof areas.$inferSelect[] = [];
  let roleList: typeof roles.$inferSelect[] = [];
  let captureList: typeof captures.$inferSelect[] = [];

  try {
    const res = await Promise.all([
      db.select().from(rpmBlocks).where(eq(rpmBlocks.status, "active")),
      db.select().from(actions),
      db.select().from(areas),
      db.select().from(roles),
      db.select().from(captures).where(eq(captures.status, "inbox")),
    ]);
    rawBlocks = res[0];
    allActions = res[1];
    areaList = res[2];
    roleList = res[3];
    captureList = res[4];
  } catch (error) {
    console.warn("Erreur de requête base de données sur l'accueil (tables/colonnes manquantes) :", error);
  }

  const blocks = rawBlocks.map((block) => {
    const blockActions = allActions.filter((a) => a.blockId === block.id);
    const area = areaList.find((a) => a.id === block.areaId) || null;
    const role = roleList.find((r) => r.id === block.roleId) || null;
    const doneCount = blockActions.filter((a) => a.isDone).length;
    const totalCount = blockActions.length;
    const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
    const mustLeft = blockActions.filter((a) => a.isMust && !a.isDone).length;

    return {
      ...block,
      actions: blockActions,
      area,
      role,
      doneCount,
      totalCount,
      progress,
      mustLeft,
    };
  });

  const totalMustMin = allActions
    .filter((a) => a.isMust && !a.isDone)
    .reduce((s, a) => s + (a.minutes || 0), 0);

  const doneCount = allActions.filter((a) => a.isDone).length;
  const weekProgress =
    allActions.length === 0
      ? 0
      : Math.round((doneCount / allActions.length) * 100);

  const inboxCount = captureList.length;
  const activeBlocks = blocks.filter((b) => b.status === "active").length;
  const totalBlocks = blocks.length;

  const mustDone = allActions.filter((a) => a.isMust && a.isDone).length;
  const mustTotal = allActions.filter((a) => a.isMust).length;

  const momentsTotal = allActions
    .filter((a) => !a.isDone)
    .reduce((s, a) => s + (a.minutes || 0), 0);

  const now = new Date();
  const todayLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <DashboardClient
      weekKey="current"
      weekLabel="Semaine en cours"
      todayLabel={todayLabel}
      areas={areaList}
      blocks={blocks}
      stats={{
        totalMustMin,
        doneCount,
        weekProgress,
        inboxCount,
        activeBlocks,
        totalBlocks,
        mustDone,
        mustTotal,
        momentsTotal,
      }}
    />
  );
}
