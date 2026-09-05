import { notFound } from "next/navigation";
import { getBlockFull, getAreas, getRoles, ensureAreasSeeded, ensureRolesValuesSeeded } from "@/lib/data";
import { BlockDetailClient } from "@/components/block-detail-client";

export const dynamic = "force-dynamic";

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureAreasSeeded();
  await ensureRolesValuesSeeded();
  const { id } = await params;
  const [block, areas, roles] = await Promise.all([
    getBlockFull(id),
    getAreas(),
    getRoles(),
  ]);
  if (!block) notFound();
  return <BlockDetailClient block={block} areas={areas} roles={roles} />;
}
