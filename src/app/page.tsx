import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return <DashboardClient />;
}
