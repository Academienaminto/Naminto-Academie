import { db } from "@/lib/db";
import type { CreateDocumentInput, CreateVersionInput } from "@/modules/documents/validation";

/** Vue publique : uniquement les documents PUBLIE, avec leurs versions
 * PUBLIE (une par langue au plus — voir RÈGLES MÉTIER §64 : une nouvelle
 * version ne doit jamais faire disparaître l'historique, seulement cesser
 * d'être "la" version courante). */
export function listPublished() {
  return db.document.findMany({
    where: { status: "PUBLIE" },
    orderBy: [{ type: "asc" }, { category: "asc" }],
    include: {
      versions: {
        where: { status: "PUBLIE" },
        orderBy: { versionNumber: "desc" },
      },
    },
  });
}

/** Vue Seuil : tous statuts, toutes versions (historique complet). */
export function listAll() {
  return db.document.findMany({
    orderBy: [{ type: "asc" }, { category: "asc" }],
    include: {
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });
}

export function findById(id: string) {
  return db.document.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" } } },
  });
}

export function findByTypeAndCategory(type: string, category: string) {
  return db.document.findFirst({
    where: { type: type as never, category: category as never },
    include: {
      versions: {
        where: { status: "PUBLIE" },
        orderBy: { versionNumber: "desc" },
      },
    },
  });
}

export function createDocument(input: CreateDocumentInput) {
  return db.document.create({ data: { ...input, status: "BROUILLON" } });
}

export function updateDocumentStatus(id: string, status: string) {
  return db.document.update({ where: { id }, data: { status } });
}

export async function createVersion(documentId: string, input: CreateVersionInput) {
  const latest = await db.documentVersion.findFirst({
    where: { documentId },
    orderBy: { versionNumber: "desc" },
  });
  const versionNumber = (latest?.versionNumber ?? 0) + 1;
  return db.documentVersion.create({
    data: { documentId, versionNumber, content: input.content, language: input.language, status: "BROUILLON" },
  });
}

export function findVersionById(id: string) {
  return db.documentVersion.findUnique({ where: { id } });
}

/** Publier une version archive automatiquement toute autre version PUBLIE
 * de la même langue pour le même document — l'ancienne reste en base
 * (historique préservé, §64), elle cesse seulement d'être la version
 * affichée publiquement. */
export async function publishVersion(versionId: string) {
  const version = await db.documentVersion.findUniqueOrThrow({ where: { id: versionId } });
  return db.$transaction([
    db.documentVersion.updateMany({
      where: {
        documentId: version.documentId,
        language: version.language,
        status: "PUBLIE",
        id: { not: versionId },
      },
      data: { status: "ARCHIVE", archivedAt: new Date() },
    }),
    db.documentVersion.update({
      where: { id: versionId },
      data: { status: "PUBLIE", effectiveAt: new Date() },
    }),
  ]);
}

export function updateVersionStatus(id: string, status: string) {
  return db.documentVersion.update({
    where: { id },
    data: { status, archivedAt: status === "ARCHIVE" ? new Date() : undefined },
  });
}

export function recordAcceptance(documentVersionId: string, userId: string) {
  return db.documentAcceptance.upsert({
    where: { documentVersionId_userId: { documentVersionId, userId } },
    update: { acceptedAt: new Date() },
    create: { documentVersionId, userId },
  });
}

export function findMyAcceptance(documentVersionId: string, userId: string) {
  return db.documentAcceptance.findUnique({
    where: { documentVersionId_userId: { documentVersionId, userId } },
  });
}
