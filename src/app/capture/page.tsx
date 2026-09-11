export const dynamic = "force-dynamic";

import {
  ensureAreasSeeded,
  ensureRolesValuesSeeded,
  getAreas,
  getCaptures,
  getRoles,
} from "@/lib/data";
import { weekKeyOf } from "@/lib/date";
import { CaptureClient } from "@/components/capture-client";

export default async function CapturePage() {
  await ensureAreasSeeded();
  await ensureRolesValuesSeeded();

  let captures: Awaited<ReturnType<typeof getCaptures>> = [];
  let areas: Awaited<ReturnType<typeof getAreas>> = [];
  let roles: Awaited<ReturnType<typeof getRoles>> = [];

  try {
    const res = await Promise.all([getCaptures(), getAreas(), getRoles()]);
    captures = res[0];
    areas = res[1];
    roles = res[2];
  } catch (e) {
    console.warn("Erreur chargement capture:", e);
  }

  const currentWeek = weekKeyOf(new Date());

  return (
    <CaptureClient
      initialCaptures={captures}
      areas={areas}
      roles={roles}
      currentWeek={currentWeek}
    />
  );
}
