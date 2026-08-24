import { db } from "@/lib/db";

// Accès base de données de l'inscription au cursus initiatique
// (modules/enrollment/service.ts). Distinct de
// modules/formations/repository.ts, qui gère l'inscription (elle aussi
// gratuite) à une formation — deux parcours séparés partageant la table
// Enrollment (cursusId XOR formationId).

export function findCursus(cursusId: string) {
  return db.cursus.findUnique({ where: { id: cursusId } });
}

export function findEnrollment(userId: string, cursusId: string) {
  return db.enrollment.findFirst({ where: { userId, cursusId } });
}

// TODO: race condition — Enrollment n'a pas de contrainte @@unique sur
// (userId, cursusId) dans le schéma Prisma ; deux requêtes concurrentes
// peuvent chacune passer le findEnrollment de
// modules/enrollment/service.ts#enroll avant que l'une n'écrive, créant
// deux inscriptions pour le même utilisateur/cursus. Pas encore protégé
// par une contrainte unique ni une transaction.
export function createEnrollment(userId: string, cursusId: string) {
  return db.enrollment.create({
    data: { userId, cursusId, status: "ACTIVE", startedAt: new Date() },
  });
}

/** Premier cours du cursus : niveau 1, position 1. */
export function findFirstCourse(cursusId: string) {
  return db.course.findFirst({
    where: { level: { cursusId, number: 1 }, position: 1 },
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

export function createCourseProgress(
  userId: string,
  courseId: string,
  enrollmentId: string,
  eligibilityStatus: string,
) {
  return db.courseProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { eligibilityStatus },
    create: {
      userId,
      courseId,
      enrollmentId,
      eligibilityStatus,
      status: "NON_COMMENCE",
    },
  });
}

export function listMyEnrollments(userId: string) {
  return db.enrollment.findMany({
    where: { userId },
    include: {
      cursus: {
        include: {
          levels: {
            orderBy: { number: "asc" },
            include: {
              courses: { orderBy: { position: "asc" }, include: { products: true } },
            },
          },
        },
      },
      formation: {
        include: {
          parts: {
            orderBy: { position: "asc" },
            include: { courses: { orderBy: { position: "asc" } } },
          },
          products: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}
