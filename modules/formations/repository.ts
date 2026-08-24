import { db } from "@/lib/db";
import type {
  CreateFormationCourseInput,
  CreateFormationInput,
  CreateFormationPartInput,
} from "@/modules/formations/validation";

const withStructure = {
  parts: {
    orderBy: { position: "asc" as const },
    include: { courses: { orderBy: { position: "asc" as const } } },
  },
};

export function listPublishedFormations() {
  return db.formation.findMany({
    where: { status: "PUBLIE" },
    orderBy: { createdAt: "asc" },
    include: withStructure,
  });
}

/** Vue Seuil : tous les statuts, y compris brouillon. */
export function listAllFormations() {
  return db.formation.findMany({
    orderBy: { createdAt: "desc" },
    include: withStructure,
  });
}

export function findFormationById(id: string) {
  return db.formation.findUnique({
    where: { id },
    include: { ...withStructure, products: true },
  });
}

/**
 * Crée la formation et, si elle est payante, le produit commercial
 * correspondant dans la même transaction — même logique que
 * modules/cursus/repository.ts createCourse (un produit payant sans
 * Product ne serait jamais achetable).
 */
export function createFormation(input: CreateFormationInput) {
  return db.$transaction(async (tx) => {
    const formation = await tx.formation.create({
      data: {
        title: input.title,
        description: input.description,
        titleEn: input.titleEn,
        descriptionEn: input.descriptionEn,
        price: input.price,
        currency: input.currency,
        language: input.language,
        status: "BROUILLON",
      },
    });

    if (input.price && input.price > 0) {
      await tx.product.create({
        data: {
          type: "FORMATION",
          formationId: formation.id,
          title: formation.title,
          price: input.price,
          currency: input.currency,
          status: "ACTIF",
        },
      });
    }

    return formation;
  });
}

export function updateFormationStatus(id: string, status: string) {
  const data: { status: string; publishedAt?: Date } = { status };
  if (status === "PUBLIE") {
    data.publishedAt = new Date();
  }
  return db.formation.update({ where: { id }, data });
}

export function findPartByFormationAndPosition(
  formationId: string,
  position: number,
) {
  return db.formationPart.findFirst({ where: { formationId, position } });
}

export function createPart(formationId: string, input: CreateFormationPartInput) {
  return db.formationPart.create({
    data: { ...input, formationId, status: "BROUILLON" },
  });
}

export function findPartById(id: string) {
  return db.formationPart.findUnique({
    where: { id },
    include: { courses: { orderBy: { position: "asc" } }, formation: true },
  });
}

export function updatePartStatus(id: string, status: string) {
  return db.formationPart.update({ where: { id }, data: { status } });
}

export function findCourseByPartAndPosition(
  formationPartId: string,
  position: number,
) {
  return db.course.findUnique({
    where: { formationPartId_position: { formationPartId, position } },
  });
}

export function createFormationCourse(input: CreateFormationCourseInput) {
  return db.course.create({
    data: {
      formationPartId: input.formationPartId,
      position: input.position,
      title: input.title,
      description: input.description,
      titleEn: input.titleEn,
      descriptionEn: input.descriptionEn,
      duration: input.duration,
      status: "BROUILLON",
    },
  });
}

export function findFormationCourseById(id: string) {
  return db.course.findUnique({
    where: { id },
    include: { formationPart: { include: { formation: true } }, quiz: true },
  });
}

export function findEnrollment(userId: string, formationId: string) {
  return db.enrollment.findFirst({ where: { userId, formationId } });
}

export function createEnrollment(userId: string, formationId: string) {
  return db.enrollment.create({
    data: { userId, formationId, status: "ACTIVE", startedAt: new Date() },
  });
}

export function findApprenantRole() {
  return db.role.findUniqueOrThrow({ where: { name: "APPRENANT" } });
}

export function grantRole(userId: string, roleId: string) {
  return db.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId },
  });
}

/** Premier cours de la formation : première partie, position 1. */
export function findFirstCourse(formationId: string) {
  return db.course.findFirst({
    where: { position: 1, formationPart: { formationId, position: 1 } },
  });
}

export function grantEligibility(
  userId: string,
  courseId: string,
  enrollmentId: string | null,
) {
  return db.courseProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { eligibilityStatus: "ELIGIBLE" },
    create: {
      userId,
      courseId,
      enrollmentId,
      eligibilityStatus: "ELIGIBLE",
      status: "NON_COMMENCE",
    },
  });
}
