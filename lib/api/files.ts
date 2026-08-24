import type { ApiResult } from "@/lib/api/auth";

interface UploadedFile {
  id: string;
  name: string;
}

export async function uploadFileRequest(file: File): Promise<ApiResult<UploadedFile>> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/v1/files", { method: "POST", body: formData });
  return res.json();
}
