export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { rpmBlocks, actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Récupérer le bloc existant
    const existingBlock = await db
      .select()
      .from(rpmBlocks)
      .where(eq(rpmBlocks.id, id));

    if (!existingBlock.length) {
      return NextResponse.json({ error: "Bloc non trouvé" }, { status: 404 });
    }

    const blockToCopy = existingBlock[0];
    const newBlockId = crypto.randomUUID();

    // Dupliquer le bloc
    await db.insert(rpmBlocks).values({
      ...blockToCopy,
      id: newBlockId,
      result: `${blockToCopy.result} (Copie)`,
      createdAt: new Date(),
    });

    // Récupérer et dupliquer les actions associées
    const existingActions = await db
      .select()
      .from(actions)
      .where(eq(actions.blockId, id));

    if (existingActions.length > 0) {
      const newActions = existingActions.map((action) => ({
        ...action,
        id: crypto.randomUUID(),
        blockId: newBlockId,
        createdAt: new Date(),
      }));
      await db.insert(actions).values(newActions);
    }

    return NextResponse.json({ success: true, newBlockId });
  } catch (error) {
    console.error("Erreur duplication bloc:", error);
    return NextResponse.json(
      { error: "Erreur lors de la duplication" },
      { status: 500 }
    );
  }
}
