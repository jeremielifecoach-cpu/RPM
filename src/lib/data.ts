export async function getDashboardData() {
  const [areasData, blocksData, actionsData, rolesData] = await Promise.all([
    db.select().from(areas),
    db.select().from(rpmBlocks),
    db.select().from(actions),
    db.select().from(roles),
  ]);

  const formattedBlocks = blocksData.map((block) => ({
    ...block,
    actions: actionsData.filter((action) => action.blockId === block.id),
  }));

  const stats = {
    actionsCount: actionsData.length,
    mustActionsCount: actionsData.filter((a) => a.priority === 1).length,
    blocksCount: blocksData.length,
    activeAreasCount: areasData.length,
    completedActionsCount: actionsData.filter((a) => a.completed).length,
  };

  const today = new Date();
  const todayLabel = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    weekKey: "current",
    weekLabel: "Semaine en cours",
    todayLabel,
    areas: areasData,
    blocks: formattedBlocks,
    stats,
  };
    }
    
