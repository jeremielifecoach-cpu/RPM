import { db } from "@/db";
import { areas, roles, values } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAreas() {
  return await db.select().from(areas);
}

export async function getRoles() {
  return await db.select().from(roles);
}

export async function getValues() {
  return await db.select().from(values);
}

export async function ensureAreasSeeded() {
  const existing = await db.select().from(areas);
  if (existing.length > 0) return;

  const seed = [
    { id: crypto.randomUUID(), slug: "sante", name: "Santé & Vitalité", icon: "activity", color: "#34D399", score: 5, position: 1 },
    { id: crypto.randomUUID(), slug: "mental", name: "Mental & Émotions", icon: "brain", color: "#38BDF8", score: 5, position: 2 },
    { id: crypto.randomUUID(), slug: "couple", name: "Couple & Passion", icon: "heart", color: "#F43F5E", score: 5, position: 3 },
    { id: crypto.randomUUID(), slug: "famille", name: "Famille & Amis", icon: "users", color: "#A78BFA", score: 5, position: 4 },
    { id: crypto.randomUUID(), slug: "mission", name: "Carrière & Mission", icon: "briefcase", color: "#F5B93C", score: 5, position: 5 },
    { id: crypto.randomUUID(), slug: "finances", name: "Finances & Liberté", icon: "coins", color: "#10B981", score: 5, position: 6 },
    { id: crypto.randomUUID(), slug: "joie", name: "Joie & Aventure", icon: "party", color: "#FACC15", score: 5, position: 7 },
  ];

  await db.insert(areas).values(seed);
}

export async function ensureRolesValuesSeeded() {
  const existingRoles = await db.select().from(roles);
  if (existingRoles.length === 0) {
    await db.insert(roles).values([
      { id: crypto.randomUUID(), name: "Leader Inspirant" },
      { id: crypto.randomUUID(), name: "Partenaire Aimant" },
      { id: crypto.randomUUID(), name: "Athlète Vital" },
    ]);
  }

  const existingValues = await db.select().from(values);
  if (existingValues.length === 0) {
    await db.insert(values).values([
      { id: crypto.randomUUID(), title: "Amour & Compassion", description: "Inconditionnel", rank: 1 },
      { id: crypto.randomUUID(), title: "Croissance continue", description: "Apprendre chaque jour", rank: 2 },
      { id: crypto.randomUUID(), title: "Liberté d'action", description: "Autonomie totale", rank: 3 },
    ]);
  }
}
