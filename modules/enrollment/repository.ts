import { db } from "@/lib/db";

export function findCursus(cursusId: string) {
  return db.cursus.findUnique({ where: { id: cursusId } });
}

export function findEnrollment(userId: string, cursusId: string) {
  return db.enrollment.findFirst({ where: { userId, cursusId } });
}

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
