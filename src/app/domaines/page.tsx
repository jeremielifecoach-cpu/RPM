import { ensureAreasSeeded, getAreas } from "@/lib/data";
import { AreasClient } from "@/components/areas-client";

export const dynamic = "force-dynamic";

export default async function DomainesPage() {
  await ensureAreasSeeded();
  const areas = await getAreas();
  return <AreasClient areas={areas} />;
}
