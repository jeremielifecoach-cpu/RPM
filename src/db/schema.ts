import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

// Exporter explicitement visionTable
export const visionTable = pgTable("vision", {
  id: text("id").primaryKey(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});
