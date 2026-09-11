import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// --- TABLES EXISTANTES (Rien ne change) ---
// (rpmBlocks, actions, captures, areas, roles)

// --- NOUVEAU : Niveau Macro CEO (Les 7 Magnifiques) ---
export const lifeVisionDomains = pgTable("life_vision_domains", {
  id: text("id").primaryKey(),
  areaId: text("area_id").references(() => areas.id), // Lien vers le domaine de vie
  title: text("title").notNull(), // Nom du Domaine
  vision: text("vision").notNull().default(""), // 1. Vision
  mission: text("mission").notNull().default(""), // 2. Mission (Pourquoi)
  values: text("values").notNull().default(""), // 3. Valeurs
  drivers: text("drivers").notNull().default(""), // 4. 3 Conducteurs
  resources: text("resources").notNull().default(""), // 5. Ressources (A/Manque)
  yearOutcome: text("year_outcome").notNull().default(""), // 6. Objectif 1 an binaire
  createdAt: timestamp("created_at").defaultNow(),
});

// --- NOUVEAU : Moteur d'exécution Trimestriel (Q1..Q4) ---
export const quarterlyMilestones = pgTable("quarterly_milestones", {
  id: text("id").primaryKey(),
  domainId: text("domain_id").references(() => lifeVisionDomains.id, { onDelete: "cascade" }),
  quarter: text("quarter").notNull(), // "Q1", "Q2", "Q3", "Q4"
  year: integer("year").notNull().default(2026),
  targetOutcome: text("target_outcome").notNull().default(""), // Jalon du trimestre
  isCurrent: boolean("is_current").notNull().default(false), // Isoler le trimestre actif
});
