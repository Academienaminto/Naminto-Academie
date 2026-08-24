import type { FileType } from "@prisma/client";
import { db } from "@/lib/db";

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
