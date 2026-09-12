import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// --- Vision ---
export const visionTable = pgTable("vision", {
  id: text("id").primaryKey(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const visions = visionTable;

// --- Values ---
export const valuesTable = pgTable("values", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const values = valuesTable;

// --- Areas ---
export const areas = pgTable("areas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  focus: text("focus"),
  score: integer("score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Roles ---
export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  areaId: text("area_id").references(() => areas.id),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- RPM Blocks ---
export const rpmBlocks = pgTable("rpm_blocks", {
  id: text("id").primaryKey(),
  areaId: text("area_id").references(() => areas.id),
  roleId: text("role_id").references(() => roles.id),
  result: text("result").notNull(),
  purpose: text("purpose").notNull(),
  timeframe: text("timeframe"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Actions ---
export const actions = pgTable("actions", {
  id: text("id").primaryKey(),
  blockId: text("block_id").references(() => rpmBlocks.id),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Captures ---
export const captures = pgTable("captures", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Journal ---
export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  mood: text("mood"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Vision Extensions ---
export const lifeVisionDomains = pgTable("life_vision_domains", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quarterlyMilestones = pgTable("quarterly_milestones", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
  
