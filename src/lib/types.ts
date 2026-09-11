import type { Area, Role, RpmBlock, ActionItem, Capture } from "@/db/schema";

export interface BlockFull extends RpmBlock {
  actions: ActionItem[];
  area: Area | null;
  role: Role | null;
  doneCount: number;
  totalCount: number;
  progress: number;
  mustLeft: number;
}

export interface DashboardStats {
  totalMustMin: number;
  doneCount: number;
  weekProgress: number;
  inboxCount: number;
  activeBlocks: number;
  totalBlocks: number;
}
