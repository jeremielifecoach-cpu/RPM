import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// 1. Domaines de vie (Areas)
export const areas = pgTable("areas", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("🎯"),
  color: text("color").notNull().default("amber"),
  score: integer("score").notNull().default(5),
  focus: text("focus").notNull().default(""),
  position: integer("position").notNull().default(0),
});

// 2. Rôles
export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("amber"),
  position: integer("position").notNull().default(0),
});

// 3. Valeurs
export const valuesTable = pgTable("values", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  rank: integer("rank").notNull().default(1),
});

// 4. Blocs RPM
export const rpmBlocks = pgTable("rpm_blocks", {
  id: text("id").primaryKey(),
  result: text("result").notNull(),
  purpose: text("purpose").notNull().default(""),
  areaId: text("area_id").references(() => areas.id),
  roleId: text("role_id").references(() => roles.id),
  status: text("status").notNull().default("active"),
  weekStart: text("week_start").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Actions / Plan d'action massif
export const actions = pgTable("actions", {
  id: text("id").primaryKey(),
  blockId: text("block_id").references(() => rpmBlocks.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isMust: boolean("is_must").notNull().default(false),
  isDone: boolean("is_done").notNull().default(false),
  minutes: integer("minutes"),
  dayOfWeek: text("day_of_week"),
  position: integer("position").notNull().default(0),
});

// 6. Captures / Boîte de réception
export const captures = pgTable("captures", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  status: text("status").notNull().default("inbox"),
  targetBlockId: text("target_block_id").references(() => rpmBlocks.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 7. Journal
export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  wins: text("wins").notNull().default(""),
  gratitude: text("gratitude").notNull().default(""),
  lessons: text("lessons").notNull().default(""),
  energyScore: integer("energy_score").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Niveau Macro CEO (Les 7 Magnifiques)
export const lifeVisionDomains = pgTable("life_vision_domains", {
  id: text("id").primaryKey(),
  areaId: text("area_id").references(() => areas.id),
  title: text("title").notNull(),
  vision: text("vision").notNull().default(""),
  mission: text("mission").notNull().default(""),
  values: text("values").notNull().default(""),
  drivers: text("drivers").notNull().default(""),
  resources: text("resources").notNull().default(""),
  yearOutcome: text("year_outcome").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// 9. Moteur d'exécution Trimestriel (Q1..Q4)
export const quarterlyMilestones = pgTable("quarterly_milestones", {
  id: text("id").primaryKey(),
  domainId: text("domain_id").references(() => lifeVisionDomains.id, { onDelete: "cascade" }),
  quarter: text("quarter").notNull(),
  year: integer("year").notNull().default(2026),
  targetOutcome: text("target_outcome").notNull().default(""),
  isCurrent: boolean("is_current").notNull().default(false),
});
