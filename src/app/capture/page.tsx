import {
  ensureAreasSeeded,
  ensureRolesValuesSeeded,
  getAreas,
  getCaptures,
  getRoles,
} from "@/lib/data";
import { weekKeyOf } from "@/lib/date";
import { CaptureClient } from "@/components/capture-client";

export const dynamic = "force-dynamic";

export default async function CapturePage() {
  await ensureAreasSeeded();
  await ensureRolesValuesSeeded();
  const [areas, roles, captures] = await Promise.all([
    getAreas(),
    getRoles(),
    getCaptures(),
  ]);

  return (
    <CaptureClient
      areas={areas}
      roles={roles}
      captures={captures}
      weekKey={weekKeyOf(new Date())}
    />
  );
}
