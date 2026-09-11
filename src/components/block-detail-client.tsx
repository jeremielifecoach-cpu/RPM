async function patchBlock(body: Record<string, unknown>) {
  await api(`/blocks/${block.id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  refresh();
}

async function removeAction(id: string) {
  await api(`/actions/${id}`, { method: "DELETE" });
  refresh();
}

async function removeBlock() {
  await api(`/blocks/${block.id}`, { method: "DELETE" });
  router.push("/");
  router.refresh();
}
