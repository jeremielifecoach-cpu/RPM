import {
  ensureAreasSeeded,
  ensureRolesValuesSeeded,
  getAreas,
  getInboxCount,
  getWeekBlocks,
} from "@/lib/data";
import { longDateFr, weekKeyOf, weekRangeLabel } from "@/lib/date";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureAreasSeeded();
  await ensureRolesValuesSeeded();
  const [areaList, inboxCount] = await Promise.all([getAreas(), getInboxCount()]);
  const weekKey = weekKeyOf(new Date());
  const blocks = await getWeekBlocks(weekKey);

  const activeBlocks = blocks.filter((b) => b.status === "active");
  const allActions = activeBlocks.flatMap((b) => b.actions);
  const musts = allActions.filter((a) => a.isMust);
  const mustDone = musts.filter((a) => a.isDone).length;
  const totalMin = allActions
    .filter((a) => !a.isDone)
    .reduce((s, a) => s + a.minutes, 0);
  const doneCount = allActions.filter((a) => a.isDone).length;
  const weekProgress =
    allActions.length === 0
      ? 0
      : Math.round((doneCount / allActions.length) * 100);

  return (
    <DashboardClient
      weekKey={weekKey}
      weekLabel={weekRangeLabel(weekKey)}
      todayLabel={longDateFr(new Date())}
      areas={areaList}
      blocks={blocks}
      stats={{
        activeBlocks: activeBlocks.length,
        totalBlocks: blocks.length,
        weekProgress,
        mustTotal: musts.length,
        mustDone,
        inboxCount,
        momentsTotal: totalMin,
      }}
    />
  );
}
