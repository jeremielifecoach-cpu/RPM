import { NextResponse } from "next/server";
import { getAreas } from "@/lib/data";

export async function GET() {
  try {
    const data = await getAreas();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du chargement des domaines" },
      { status: 500 }
    );
  }
}
