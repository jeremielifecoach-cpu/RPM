const handleSave = async (id: string, newScore: number, newFocus: string) => {
  try {
    await fetch(`/api/areas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: newScore,
        focus: newFocus,
      }),
    });
    router.refresh();
  } catch (err) {
    console.error("Erreur de sauvegarde:", err);
  }
};
