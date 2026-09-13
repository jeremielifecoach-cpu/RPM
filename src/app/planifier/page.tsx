import { db } from "@/db";
import { areas as areasTable, roles as rolesTable, rpmBlocks, actions } from "@/db/schema";
import PlanifierPageClient from "@/components/planifier-page-client";

export const dynamic = "force-dynamic";

export default async function PlanifierPage() {
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
      doneCount: actionsData.filter((a) => a.blockId === block.id && a.completed).length,
      totalCount: actionsData.filter((a) => a.blockId === block.id).length,
    }));

    return (
      <PlanifierPageClient
        areas={areas as any}
        roles={roles as any}
        blocks={formattedBlocks as any}
      />
    );
  } catch (error) {
    console.error("Erreur PlanifierPage:", error);
    return (
      <PlanifierPageClient
        areas={[]}
        roles={[]}
        blocks={[]}
      />
    );
  }
}
