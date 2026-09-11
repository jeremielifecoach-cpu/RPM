export const dynamic = "force-dynamic";

import { getJournal } from "@/lib/data";
import { JournalClient } from "@/components/journal-client";

export default async function JournalPage() {
  let entries: Awaited<ReturnType<typeof getJournal>> = [];
  try {
    entries = await getJournal();
  } catch (e) {
    console.warn("Erreur chargement journal:", e);
  }

  return <JournalClient entries={entries} />;
}
