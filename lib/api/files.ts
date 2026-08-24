// Appels API centralisés pour l'upload de fichiers — mêmes conventions
// que lib/api/auth.ts. Le stockage effectif (Supabase Storage) est géré
// côté serveur par lib/storage/ ; ce fichier ne fait que poster le
// FormData vers la route et retourner l'ApiResult.
import type { ApiResult } from "@/lib/api/auth";

interface UploadedFile {
  id: string;
  name: string;
}

export async function uploadFileRequest(file: File): Promise<ApiResult<UploadedFile>> {
  const formData = new FormData();
  formData.append("file", file);
  // Pas de header Content-Type manuel : le navigateur fixe lui-même le
  // boundary multipart/form-data correct pour un FormData.
  const res = await fetch("/api/v1/files", { method: "POST", body: formData });
  return res.json();
}
