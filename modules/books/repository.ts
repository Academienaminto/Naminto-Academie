import { db } from "@/lib/db";
import type { CreateBookInput } from "@/modules/books/validation";

// Couche d'accès aux données du module Livres (Book, BookVersion, et
// lecture d'Access/écriture de Download côté bibliothèque). Consommée
// uniquement par modules/books/service.ts, qui porte les règles métier
// (RÈGLES MÉTIER §39-42) — ce fichier ne fait aucune vérification de
// droit d'accès lui-même, il exécute ce que le service lui demande.
// Invariant à préserver : createBook crée le Product associé dans la même
// transaction (un livre payant sans Product ne serait jamais achetable).

export function listPublishedBooks() {
  return db.book.findMany({
    where: { status: "PUBLIE" },
    orderBy: { createdAt: "desc" },
    include: { products: true },
  });
}

/** Vue Seuil : tous les statuts, y compris brouillon. */
export function listAllBooks() {
  return db.book.findMany({
    orderBy: { createdAt: "desc" },
    include: { products: true },
  });
}

export function findBookById(id: string) {
  return db.book.findUnique({
    where: { id },
    include: {
      versions: { orderBy: { versionNumber: "desc" } },
      products: true,
    },
  });
}

/**
 * Crée le livre et, s'il est payant, le produit commercial correspondant
 * dans la même transaction — même logique que modules/cursus et
 * modules/formations (un livre payant sans Product ne serait jamais
 * achetable).
 */
export function createBook(input: CreateBookInput) {
  return db.$transaction(async (tx) => {
    const book = await tx.book.create({
      data: {
        title: input.title,
        description: input.description,
        titleEn: input.titleEn,
        descriptionEn: input.descriptionEn,
        author: input.author,
        isFree: input.isFree,
        price: input.isFree ? null : input.price,
        currency: input.currency,
        language: input.language,
        status: "BROUILLON",
      },
    });

    if (!input.isFree && input.price && input.price > 0) {
      await tx.product.create({
        data: {
          type: "BOOK",
          bookId: book.id,
          title: book.title,
          price: input.price,
          currency: input.currency,
          status: "ACTIF",
        },
      });
    }

    return book;
  });
}

export function updateBookStatus(id: string, status: string) {
  const data: { status: string; publishedAt?: Date } = { status };
  if (status === "PUBLIE") {
    data.publishedAt = new Date();
  }
  return db.book.update({ where: { id }, data });
}

export function findLatestVersion(bookId: string) {
  return db.bookVersion.findFirst({
    where: { bookId },
    orderBy: { versionNumber: "desc" },
  });
}

/** Les versions de livre sont publiées dès leur ajout (pas de brouillon
 * intermédiaire) : seul le droit d'accès au livre lui-même est gardé — voir
 * RÈGLES MÉTIER §42, le droit du lecteur reste lié à son achat, pas à la
 * version. */
export function createVersion(bookId: string, versionNumber: number, fileId: string) {
  return db.bookVersion.create({
    data: { bookId, versionNumber, fileId, status: "PUBLIE", publishedAt: new Date() },
  });
}

export function findLatestPublishedVersion(bookId: string) {
  return db.bookVersion.findFirst({
    where: { bookId, status: "PUBLIE" },
    orderBy: { versionNumber: "desc" },
    include: { file: true },
  });
}

export function findActiveAccessForProduct(userId: string, productId: string) {
  return db.access.findFirst({ where: { userId, productId, status: "ACTIF" } });
}

/** Le lien signé est immédiatement fourni au moment de l'appel : le
 * téléchargement est donc considéré fourni (TERMINE) dès l'enregistrement,
 * il n'y a pas de suivi de progression côté serveur. */
export function recordDownload(userId: string, fileId: string, accessId: string | null) {
  return db.download.create({
    data: { userId, fileId, accessId, status: "TERMINE", completedAt: new Date() },
  });
}
