import { db } from "@/db";
import { rpmBlocks, actions, areas, roles, captures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const res = await Promise.all([
      db.select().from(rpmBlocks).where(eq(rpmBlocks.completed, false)),
      db.select().from(actions),
      db.select().from(areas),
      db.select().from(roles),
      db.select().from(captures).where(eq(captures.processed, false)),
    ]);

    const blocksData = res[0] || [];
    const actionsData = res[1] || [];
    const areasData = res[2] || [];
    const rolesData = res[3] || [];
    const capturesData = res[4] || [];

    return (
      <DashboardClient
        initialBlocks={blocksData}
        initialActions={actionsData}
        initialAreas={areasData}
        initialRoles={rolesData}
        initialCaptures={capturesData}
      />
    );
  } catch (error) {
    console.error("Erreur chargement Dashboard:", error);
    return (
      <DashboardClient
        initialBlocks={[]}
        initialActions={[]}
        initialAreas={[]}
        initialRoles={[]}
        initialCaptures={[]}
      />
    );
  }
}
