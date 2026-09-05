import type { ActionItem, Area, Capture, JournalEntry, Role, RpmBlock } from "@/db/schema";

export type BlockFull = RpmBlock & {
  actions: ActionItem[];
  area: Area | null;
  role: Role | null;
  doneCount: number;
  totalCount: number;
  mustLeft: number;
  progress: number;
};

export type CaptureWithArea = Capture & { area: Area | null };

export type DashboardStats = {
  activeBlocks: number;
  totalBlocks: number;
  weekProgress: number;
  mustTotal: number;
  mustDone: number;
  inboxCount: number;
  momentsTotal: number;
};

export type { ActionItem, Area, Capture, JournalEntry, Role, RpmBlock };
