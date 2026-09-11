import { getDashboardData } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard-client";

export default async function HomePage() {
  const { blocks, actions, areas, captures, stats } = await getDashboardData();

  return (
    <DashboardClient
      blocks={blocks}
      actions={actions}
      areas={areas}
      captures={captures}
      stats={stats}
    />
  );
}
