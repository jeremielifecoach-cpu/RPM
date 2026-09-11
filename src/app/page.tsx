import { db } from "@/db";
import { rpmBlocks, actions, areas, captures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";

export default async function HomePage() {
  const [blocks, allActions, areaList, captureList] = await Promise.all([
    db.select().from(rpmBlocks).where(eq(rpmBlocks.status, "active")),
    db.select().from(actions),
    db.select().from(areas),
    db.select().from(captures).where(eq(captures.status, "inbox")),
  ]);

  const totalMin = allActions
    .filter((a) => !a.isDone)
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
        totalMin,
        doneCount,
        weekProgress,
      }}
    />
  );
}
