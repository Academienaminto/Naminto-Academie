import { AppError } from "@/lib/errors";
import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { uploadFile } from "@/modules/files/service";

// Primitive de stockage générique : n'importe quel utilisateur authentifié
// peut uploader un fichier (matériel de cours par le Seuil, preuve
// pratique par un apprenant, etc.). L'autorisation "ce fichier a-t-il sa
// place dans ce contexte précis" relève du domaine appelant, pas de ce
// point d'entrée générique (PROMPT MASTER STOCKAGE : le stockage n'est
// jamais source de vérité métier).
export const POST = handleRoute(async (req) => {
  const user = await requireUser();

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new AppError("VALIDATION_ERROR", "Aucun fichier fourni.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const created = await uploadFile(user.id, {
    name: file.name,
    mimeType: file.type,
    size: file.size,
    buffer,
  });

  return ok(created, 201);
});
