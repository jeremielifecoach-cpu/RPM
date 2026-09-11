import { db } from "@/db";
import { rpmBlocks, actions, areas, roles, captures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";

export default async function HomePage() {
  const [rawBlocks, allActions, areaList, roleList, captureList] = await Promise.all([
    db.select().from(rpmBlocks).where(eq(rpmBlocks.status, "active")),
    db.select().from(actions),
    db.select().from(areas),
    db.select().from(roles),
    db.select().from(captures).where(eq(captures.status, "inbox")),
  ]);

  // Assembler la structure BlockFull complète
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

  return (
    <DashboardClient
      blocks={blocks}
      actions={allActions}
      areas={areaList}
      captures={captureList}
      stats={{
        totalMustMin,
        doneCount,
        weekProgress,
      }}
    />
  );
}
