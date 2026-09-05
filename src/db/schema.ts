import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Domaines de vie (Areas of Life) — méthode RPM de Tony Robbins
 * Ex : Corps & Énergie, Émotions, Relations, Temps, Carrière, Finances…
 */
export const areas = pgTable("areas", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("star"),
  color: text("color").notNull().default("#F59E0B"),
  score: integer("score").notNull().default(5),
  focus: text("focus").notNull().default(""),
  position: integer("position").notNull().default(0),
});

/** Rôles de vie (qui tu es / qui tu veux être) */
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("#F59E0B"),
  position: integer("position").notNull().default(0),
});

/** Valeurs personnelles */
export const valuesTable = pgTable("values", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
});

/** Boîte de capture — vider son esprit (RPM étape 1) */
export const captures = pgTable("captures", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  areaId: uuid("area_id").references(() => areas.id, { onDelete: "set null" }),
  status: text("status").notNull().default("inbox"), // inbox | processed
  createdAt: timestamp("created_at", { mode: "string" })
    .notNull()
    .defaultNow(),
});

/**
 * Bloc RPM — Résultat, Pourquoi (raison), Plan d'action massif
 * Planification hebdomadaire (Rapid Planning Method)
 */
export const rpmBlocks = pgTable("rpm_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  result: text("result").notNull(), // R — le résultat précis et mesurable
  purpose: text("purpose").notNull().default(""), // P — les raisons émotionnelles
  areaId: uuid("area_id").references(() => areas.id, { onDelete: "set null" }),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "set null" }),
  status: text("status").notNull().default("active"), // active | victoire | archived
  weekStart: text("week_start").notNull(), // AAAA-MM-JJ (lundi)
  createdAt: timestamp("created_at", { mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .notNull()
    .defaultNow(),
});

/** Plan d'action massif — M (les actions du bloc) */
export const actions = pgTable("actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockId: uuid("block_id")
    .notNull()
    .references(() => rpmBlocks.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isMust: boolean("is_must").notNull().default(false), // MUST (obligatoire) vs "ce serait bien"
  isDone: boolean("is_done").notNull().default(false),
  minutes: integer("minutes").notNull().default(15),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string" })
    .notNull()
    .defaultNow(),
});

/** Journal quotidien — gratitude, victoires, réflexion (priming) */
export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull().default("gratitude"), // gratitude | victoire | reflexion
  content: text("content").notNull(),
  date: text("date").notNull(), // AAAA-MM-JJ
  createdAt: timestamp("created_at", { mode: "string" })
    .notNull()
    .defaultNow(),
});

export type Area = typeof areas.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type ValueItem = typeof valuesTable.$inferSelect;
export type Capture = typeof captures.$inferSelect;
export type RpmBlock = typeof rpmBlocks.$inferSelect;
export type ActionItem = typeof actions.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
