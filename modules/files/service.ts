import { randomBytes } from "node:crypto";
import { AppError } from "@/lib/errors";
import * as storage from "@/lib/storage/r2";
import * as repo from "@/modules/files/repository";
import { classifyMimeType, MAX_SIZE_BY_TYPE } from "@/modules/files/validation";

// PROMPT MASTER STOCKAGE : upload → 1. authentifier ; 2. vérifier
// permission (fait par la route) ; 3. valider le fichier ; 4. stocker ;
// 5. enregistrer les métadonnées. Le contenu binaire ne transite jamais
// par la base de données — seule la référence de stockage y est conservée.

export async function uploadFile(
  userId: string,
  file: { name: string; mimeType: string; size: number; buffer: Buffer },
) {
  const type = classifyMimeType(file.mimeType);
  if (!type) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Type de fichier non autorisé : ${file.mimeType}.`,
    );
  }

  const maxSize = MAX_SIZE_BY_TYPE[type];
  if (file.size > maxSize) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)} Mo pour ce type).`,
    );
  }

  const key = `uploads/${userId}/${randomBytes(16).toString("hex")}-${file.name}`;

  try {
    await storage.uploadObject(key, file.buffer, file.mimeType);
  } catch (err) {
    console.error("[r2-upload-failed]", err);
    throw new AppError(
      "INTERNAL_ERROR",
      "Impossible de stocker le fichier pour le moment.",
      undefined,
      "common.uploadFailed",
    );
  }

  return repo.createFile({
    name: file.name,
    type,
    mimeType: file.mimeType,
    size: file.size,
    storageReference: key,
    uploadedBy: userId,
  });
}

/** Un fichier privé n'est jamais servi sans vérification côté serveur
 * (PROMPT MASTER STOCKAGE §36 STOCKAGE PRIVÉ). */
export async function getDownloadUrl(
  fileId: string,
  userId: string,
  canManageAll: boolean,
) {
  const file = await repo.findFileById(fileId);
  if (!file) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Fichier introuvable.",
      undefined,
      "files.notFound",
    );
  }
  if (!canManageAll && file.uploadedBy !== userId) {
    throw new AppError(
      "FORBIDDEN",
      "Ce fichier ne vous appartient pas.",
      undefined,
      "files.forbidden",
    );
  }

  try {
    return await storage.getSignedDownloadUrl(file.storageReference);
  } catch (err) {
    console.error("[r2-signed-url-failed]", err);
    throw new AppError(
      "INTERNAL_ERROR",
      "Impossible de générer le lien de téléchargement pour le moment.",
      undefined,
      "common.downloadLinkFailed",
    );
  }
}
