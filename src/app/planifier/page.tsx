import { db } from "@/db";
import { areas as areasTable, roles as rolesTable, rpmBlocks, actions } from "@/db/schema";
import { PlanningClient } from "@/components/planning-client";
import { weekKeyOf, addWeeks } from "@/lib/date";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ semaine?: string }>;
}

export default async function PlanifierPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentWeekKey = params?.semaine || weekKeyOf(new Date());
  const prevWeekKey = addWeeks(currentWeekKey, -1);
  const nextWeekKey = addWeeks(currentWeekKey, 1);

  try {
    const [areas, roles, blocksData, actionsData] = await Promise.all([
      db.select().from(areasTable),
      db.select().from(rolesTable),
      db.select().from(rpmBlocks),
      db.select().from(actions),
    ]);

    const formattedBlocks = blocksData.map((block) => ({
      ...block,
      actions: actionsData.filter((a) => a.blockId === block.id),
      area: areas.find((a) => a.id === block.areaId) || null,
      role: roles.find((r) => r.id === block.roleId) || null,
    }));

    return (
      <PlanningClient
        areas={areas}
        roles={roles}
        blocks={formattedBlocks as any}
        weekKey={currentWeekKey}
        prevWeekKey={prevWeekKey}
        nextWeekKey={nextWeekKey}
      />
    );
  } catch (error) {
    console.error("Erreur PlanifierPage:", error);
    return (
      <PlanningClient
        areas={[]}
        roles={[]}
        blocks={[]}
        weekKey={currentWeekKey}
        prevWeekKey={prevWeekKey}
        nextWeekKey={nextWeekKey}
      />
    );
  }
}
