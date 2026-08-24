import type { FileType } from "@prisma/client";
import { db } from "@/lib/db";

// Couche d'accès aux données de l'entité File : les métadonnées d'un
// fichier générique stocké sur R2 (nom, type, taille, propriétaire, et
// storageReference — la clé R2). Consommée par modules/files/service.ts.
// Invariant : storageReference est le seul lien vers le contenu binaire
// réel (jamais stocké en base) — voir lib/storage/r2.ts. D'autres modules
// (ex. BookVersion.fileId dans modules/books) référencent ces lignes par
// id pour associer un fichier à leur propre logique métier.

export function createFile(input: {
  name: string;
  type: FileType;
  mimeType: string;
  size: number;
  storageReference: string;
  uploadedBy: string;
}) {
  return db.file.create({ data: { ...input, status: "ACTIF" } });
}

export function findFileById(id: string) {
  return db.file.findUnique({ where: { id } });
}
