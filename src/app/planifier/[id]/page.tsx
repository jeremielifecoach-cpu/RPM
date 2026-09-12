import { notFound } from "next/navigation";
import { getBlockFull, getAreas, getRoles, ensureAreasSeeded, ensureRolesValuesSeeded } from "@/lib/data";
import { BlockDetailClient } from "@/components/block-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanifierDetailPage({ params }: PageProps) {
  const { id } = await params;

  await ensureAreasSeeded();
  await ensureRolesValuesSeeded();

  const [rawBlock, areas, roles] = await Promise.all([
    getBlockFull(id),
    getAreas(),
    getRoles(),
  ]);

  if (!rawBlock) notFound();

  const area = areas.find((a) => a.id === rawBlock.areaId) || null;
  const role = roles.find((r) => r.id === rawBlock.roleId) || null;
  const actionsList = rawBlock.actions || [];
  const doneCount = actionsList.filter((a) => a.completed).length;
  const totalCount = actionsList.length;
  const mustCount = actionsList.filter((a) => a.priority === 1).length;
  const mustDone = actionsList.filter((a) => a.priority === 1 && a.completed).length;

  const fullBlock = {
    ...rawBlock,
    area,
    role,
    doneCount,
    totalCount,
    mustCount,
    mustDone,
  };

  return <BlockDetailClient block={fullBlock as any} areas={areas as any} roles={roles as any} />;
}
