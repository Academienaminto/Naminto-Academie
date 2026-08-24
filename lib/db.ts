// Client Prisma partagé — point d'entrée unique vers la base (Supabase
// Postgres) pour tout le code serveur (`import { db } from "@/lib/db"`).
// En dev, Next.js recharge les modules à chaud à chaque changement de
// fichier ; sans le cache sur `globalThis`, chaque rechargement créerait
// une nouvelle instance de PrismaClient (donc un nouveau pool de
// connexions) et finirait par épuiser les connexions disponibles.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  // En production, une seule instance vit de toute façon pour la durée du
  // process : pas besoin de la mettre en cache sur globalThis.
  globalForPrisma.prisma = db;
}
