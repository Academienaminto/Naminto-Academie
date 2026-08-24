import type { FileType } from "@prisma/client";

// Règles de classification et de taille pour l'upload générique
// (modules/files/service.ts) : associe un mimeType client à un FileType
// interne et plafonne la taille acceptée par type.
//
// RÈGLES MÉTIER — valeurs par défaut (23/08/2026, configurables) : les
// limites définitives doivent être fixées en configuration (PROMPT MASTER
// STOCKAGE §note) ; celles-ci débloquent le développement en attendant.
export const MAX_SIZE_BY_TYPE: Record<FileType, number> = {
  IMAGE: 10 * 1024 * 1024, // 10 Mo
  PDF: 20 * 1024 * 1024, // 20 Mo
  DOCUMENT: 20 * 1024 * 1024, // 20 Mo
  VIDEO: 500 * 1024 * 1024, // 500 Mo — à terme, upload direct vers R2 via
  // URL présignée plutôt que proxifié par le serveur (non implémenté ici).
};

const MIME_TO_TYPE: Record<string, FileType> = {
  "application/pdf": "PDF",
  "image/png": "IMAGE",
  "image/jpeg": "IMAGE",
  "image/webp": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
};

export function classifyMimeType(mimeType: string): FileType | null {
  return MIME_TO_TYPE[mimeType] ?? null;
}
