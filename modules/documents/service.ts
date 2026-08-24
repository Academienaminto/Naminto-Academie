import { AppError } from "@/lib/errors";
import * as repo from "@/modules/documents/repository";
import type { CreateDocumentInput, CreateVersionInput } from "@/modules/documents/validation";

// RÈGLES MÉTIER §63-64 DOCUMENTS RÉGLEMENTAIRES : la plateforme doit
// présenter FAQ (par catégorie), confidentialité, statut, règlement
// intérieur, règles pédagogiques/délais/séances, dans un français simple
// et clair, avec la version anglaise quand elle existe. Les documents
// importants sont versionnés — une nouvelle version n'efface jamais
// l'historique des précédentes (voir modules/documents/repository.ts
// publishVersion).

export function listPublished() {
  return repo.listPublished();
}

export function listAll() {
  return repo.listAll();
}

export async function getDocument(id: string) {
  const document = await repo.findById(id);
  if (!document) {
    throw new AppError("RESOURCE_NOT_FOUND", "Document introuvable.");
  }
  return document;
}

/** Résout un document publié par type (+ catégorie) — utilisé par les
 * pages publiques /confidentialite, /statut, etc. */
export async function getPublishedByTypeAndCategory(type: string, category: string) {
  const document = await repo.findByTypeAndCategory(type, category);
  if (!document || document.status !== "PUBLIE") {
    return null;
  }
  return document;
}

/** La FAQ regroupe plusieurs catégories (générale, cursus, formations,
 * cours, paiements — RÈGLES MÉTIER §63) affichées ensemble sur une seule
 * page publique, plutôt qu'une page par catégorie. */
export async function getPublishedFaqByCategory() {
  const all = await repo.listPublished();
  return all.filter((doc) => doc.type === "FAQ" && doc.versions.length > 0);
}

export function createDocument(input: CreateDocumentInput) {
  return repo.createDocument(input);
}

export async function setDocumentStatus(id: string, status: string) {
  await getDocument(id);
  return repo.updateDocumentStatus(id, status);
}

export async function addVersion(documentId: string, input: CreateVersionInput) {
  await getDocument(documentId);
  return repo.createVersion(documentId, input);
}

async function getVersion(id: string) {
  const version = await repo.findVersionById(id);
  if (!version) {
    throw new AppError("RESOURCE_NOT_FOUND", "Version introuvable.");
  }
  return version;
}

export async function setVersionStatus(id: string, status: string) {
  await getVersion(id);
  if (status === "PUBLIE") {
    return repo.publishVersion(id);
  }
  return repo.updateVersionStatus(id, status);
}

export async function acceptVersion(versionId: string, userId: string) {
  const version = await getVersion(versionId);
  if (version.status !== "PUBLIE") {
    throw new AppError(
      "INVALID_STATE",
      "Seule la version publiée d'un document peut être acceptée.",
      undefined,
      "documents.canOnlyAcceptPublished",
    );
  }
  return repo.recordAcceptance(versionId, userId);
}

export function getMyAcceptance(versionId: string, userId: string) {
  return repo.findMyAcceptance(versionId, userId);
}
