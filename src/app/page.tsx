import { getDashboardData } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const data = await getDashboardData();

    return (
      <DashboardClient
        weekKey={data.weekKey}
        weekLabel={data.weekLabel}
        todayLabel={data.todayLabel}
        areas={data.areas}
        blocks={data.blocks}
        stats={data.stats}
      />
    );
  } catch (error) {
    console.error("Erreur chargement Dashboard:", error);
    return (
      <DashboardClient
        weekKey=""
        weekLabel=""
        todayLabel=""
        areas={[]}
        blocks={[]}
        stats={{
          actionsCount: 0,
          mustActionsCount: 0,
          blocksCount: 0,
          activeAreasCount: 0,
          completedActionsCount: 0,
        }}
      />
    );
  }
}
