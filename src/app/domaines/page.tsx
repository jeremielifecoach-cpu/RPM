export const dynamic = "force-dynamic";

import { ensureAreasSeeded, getAreas } from "@/lib/data";
import { AreasClient } from "@/components/areas-client";

export default async function DomainesPage() {
  await ensureAreasSeeded();
  const areas = await getAreas();
  return <AreasClient initialAreas={areas} />;
}
