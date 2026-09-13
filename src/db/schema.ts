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
  color: text("color").default("#f5b93c"),
  icon: text("icon").default("star"),
  score: integer("score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Roles ---
export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  areaId: text("area_id").references(() => areas.id),
  name: text("name").notNull(),
  title: text("title"),
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
  weekStart: text("week_start"),
  status: text("status").default("active"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Actions ---
export const actions = pgTable("actions", {
  id: text("id").primaryKey(),
  blockId: text("block_id").references(() => rpmBlocks.id),
  content: text("content").notNull(),
  title: text("title"),
  isDone: boolean("is_done").default(false),
  completed: boolean("completed").default(false),
  isMust: boolean("is_must").default(false),
  priority: integer("priority").default(0),
  minutes: integer("minutes").default(15),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Captures ---
export const captures = pgTable("captures", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  status: text("status").default("inbox"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Journal ---
export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  date: text("date"),
  wins: text("wins"),
  gratitude: text("gratitude"),
  lessons: text("lessons"),
  content: text("content"),
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
  domainId: text("domain_id").references(() => lifeVisionDomains.id),
  title: text("title"),
  quarter: text("quarter").notNull(),
  targetOutcome: text("target_outcome"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Area = typeof areas.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type RpmBlock = typeof rpmBlocks.$inferSelect;
export type ActionItem = typeof actions.$inferSelect;
export type Capture = typeof captures.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
