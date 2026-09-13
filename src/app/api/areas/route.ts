import { NextResponse } from "next/server";
import { getAreas } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getAreas();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur chargement domaines" }, { status: 500 });
  }
}
