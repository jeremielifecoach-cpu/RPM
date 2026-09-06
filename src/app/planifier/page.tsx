import { db } from "@/db";
import { areas as areasTable, roles as rolesTable, rpmBlocks, actions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PlanningClient } from "@/components/planning-client";

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toISOString().slice(0, 10);
}

function addWeeks(dateStr: string, weeks: number) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + weeks * 7);
  return date.toISOString().slice(0, 10);
}

export default async function PlanifierPage({
  searchParams,
}: {
  searchParams: Promise<{ semaine?: string }>;
}) {
  const params = await searchParams;
  const weekKey = params.semaine || getMonday(new Date());
  const prevWeekKey = addWeeks(weekKey, -1);
  const nextWeekKey = addWeeks(weekKey, 1);

  const [areas, roles, blocksData] = await Promise.all([
    db.select().from(areasTable),
    db.select().from(rolesTable),
    db.select().from(rpmBlocks).where(eq(rpmBlocks.weekStart, weekKey)),
  ]);

  const blocks = await Promise.all(
    blocksData.map(async (block) => {
      const blockActions = await db
        .select()
        .from(actions)
        .where(eq(actions.blockId, block.id));
      const area = areas.find((a) => a.id === block.areaId) || null;
      const role = roles.find((r) => r.id === block.roleId) || null;
      return { ...block, area, role, actions: blockActions };
    })
  );

  return (
    <PlanningClient
      areas={areas}
      roles={roles}
      blocks={blocks}
      weekKey={weekKey}
      prevWeekKey={prevWeekKey}
      nextWeekKey={nextWeekKey}
    />
  );
}
