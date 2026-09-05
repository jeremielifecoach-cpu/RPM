import {
  ensureAreasSeeded,
  ensureRolesValuesSeeded,
  getAreas,
  getRoles,
  getWeekBlocks,
} from "@/lib/data";
import { weekKeyOf } from "@/lib/date";
import { PlanningClient } from "@/components/planning-client";

export const dynamic = "force-dynamic";

export default async function PlanifierPage({
  searchParams,
}: {
  searchParams: Promise<{ semaine?: string }>;
}) {
  await ensureAreasSeeded();
  await ensureRolesValuesSeeded();
  const { semaine } = await searchParams;
  const weekKey = semaine && /^\d{4}-\d{2}-\d{2}$/.test(semaine)
    ? weekKeyOf(semaine)
    : weekKeyOf(new Date());
  const [areas, roles, blocks] = await Promise.all([
    getAreas(),
    getRoles(),
    getWeekBlocks(weekKey),
  ]);
  return (
    <PlanningClient
      areas={areas}
      roles={roles}
      blocks={blocks}
      weekKey={weekKey}
    />
  );
}
