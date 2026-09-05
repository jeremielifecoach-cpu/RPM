import {
  ensureRolesValuesSeeded,
  getRoles,
  getValues,
} from "@/lib/data";
import { RolesClient } from "@/components/roles-client";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  await ensureRolesValuesSeeded();
  const [roles, values] = await Promise.all([getRoles(), getValues()]);
  return <RolesClient roles={roles} values={values} />;
}
