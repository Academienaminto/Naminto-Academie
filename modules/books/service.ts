import { AppError } from "@/lib/errors";
import * as storage from "@/lib/storage/r2";
import * as repo from "@/modules/books/repository";
import type { AddBookVersionInput, CreateBookInput } from "@/modules/books/validation";
import type { PublishInput } from "@/modules/cursus/validation";

// RÈGLES MÉTIER §39-42 : bibliothèque indépendante du cursus et des
// formations, sans quiz ni progression pédagogique — juste ACHAT (si
// payant) → DROIT DE TÉLÉCHARGEMENT → TÉLÉCHARGEMENT.
//
// Ce module ne fait QUE consommer le DROIT D'ACCÈS : l'ACHAT → PAIEMENT →
// VÉRIFICATION → CONFIRMATION (ARCHITECTURE GÉNÉRALE §6) qui crée l'Access
// est entièrement porté par modules/payments. getDownloadUrl ci-dessous se
// contente de lire un Access déjà ACTIF, jamais de le créer.

export function listCatalog() {
  return repo.listPublishedBooks();
}

export function listAll() {
  return repo.listAllBooks();
}

/**
 * canManageAll=false (visiteur/membre, GET public) : un livre non publié
 * répond 404 comme s'il n'existait pas, pour ne pas laisser deviner son
 * titre/prix avant publication officielle. Le Seuil (MANAGE_BOOKS) passe
 * canManageAll=true pour prévisualiser/gérer les brouillons.
 */
export async function getBook(id: string, canManageAll = false) {
  const book = await repo.findBookById(id);
  if (!book || (!canManageAll && book.status !== "PUBLIE")) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Livre introuvable.",
      undefined,
      "books.notFound",
    );
  }
  return book;
}

export function createBook(input: CreateBookInput) {
  return repo.createBook(input);
}

export async function setBookStatus(id: string, input: PublishInput) {
  await getBook(id, true); // 404 si absent ; Seuil, doit voir les brouillons
  return repo.updateBookStatus(id, input.status);
}

/** Chaque version ajoutée devient la version courante pour le
 * téléchargement (numérotée automatiquement) — voir RÈGLES MÉTIER §42. */
export async function addVersion(bookId: string, input: AddBookVersionInput) {
  await getBook(bookId, true); // 404 si absent ; Seuil, doit voir les brouillons
  const latest = await repo.findLatestVersion(bookId);
  const versionNumber = (latest?.versionNumber ?? 0) + 1;
  return repo.createVersion(bookId, versionNumber, input.fileId);
}

/**
 * Téléchargement d'un livre. Gratuit (§39) : accessible à tout membre
 * authentifié, sans Access ni Order. Payant (§41) : exige un Access ACTIF
 * au produit du livre — jamais déduit d'un état envoyé par le frontend.
 */
export async function getDownloadUrl(userId: string, bookId: string) {
  const book = await getBook(bookId);
  if (book.status !== "PUBLIE") {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Livre introuvable.",
      undefined,
      "books.notFound",
    );
  }

  const version = await repo.findLatestPublishedVersion(bookId);
  if (!version?.file) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Aucun fichier disponible pour ce livre.",
      undefined,
      "books.noFileAvailable",
    );
  }

  let accessId: string | null = null;
  if (!book.isFree) {
    // Un livre payant n'a qu'un seul Product associé, créé par
    // repo.createBook au moment de la création du livre — d'où l'index 0.
    const product = book.products[0];
    if (!product) {
      throw new AppError(
        "PAYMENT_REQUIRED",
        "Ce livre doit être acheté.",
        undefined,
        "books.purchaseRequired",
      );
    }
    // Le droit d'accès est relu en base à partir du userId authentifié
    // (jamais un paramètre envoyé par le client) : c'est la seule source de
    // vérité pour savoir si ce livre payant a été acheté.
    const access = await repo.findActiveAccessForProduct(userId, product.id);
    if (!access) {
      throw new AppError(
        "PAYMENT_REQUIRED",
        "Ce livre doit être acheté.",
        undefined,
        "books.purchaseRequired",
      );
    }
    accessId = access.id;
  }

  let url: string;
  try {
    url = await storage.getSignedDownloadUrl(version.file.storageReference);
  } catch (err) {
    console.error("[r2-signed-url-failed]", err);
    throw new AppError(
      "INTERNAL_ERROR",
      "Impossible de générer le lien de téléchargement pour le moment.",
      undefined,
      "common.downloadLinkFailed",
    );
  }

  await repo.recordDownload(userId, version.file.id, accessId);

  return url;
}
