import { getJournal } from "@/lib/data";
import { JournalClient } from "@/components/journal-client";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const entries = await getJournal();
  return <JournalClient entries={entries} />;
}
