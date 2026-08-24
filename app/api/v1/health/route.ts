import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ARCHITECTURE DE DÉPLOIEMENT §28 MONITORING : les composants FRONTEND,
// API, DATABASE et STORAGE doivent pouvoir être vérifiés. Public et sans
// authentification par nature (c'est le point que les outils de
// supervision externes interrogent) — ne renvoie jamais de détail
// interne (message d'erreur brut, stack), seulement un statut par
// composant.
export async function GET() {
  const checks: Record<string, "ok" | "down"> = {
    api: "ok",
    database: "down",
  };

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "down";
  }

  const healthy = Object.values(checks).every((status) => status === "ok");

  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks },
    { status: healthy ? 200 : 503 },
  );
}
