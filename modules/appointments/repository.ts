import { db } from "@/lib/db";

export function createAppointment(
  userId: string,
  proposedAt: Date,
  learningSessionId: string | undefined,
) {
  return db.appointment.create({
    data: { userId, proposedAt, learningSessionId, status: "PROPOSE" },
  });
}

export function findById(id: string) {
  return db.appointment.findUnique({ where: { id } });
}

export function listMine(userId: string) {
  return db.appointment.findMany({
    where: { userId },
    orderBy: { proposedAt: "desc" },
  });
}

export function listAll() {
  return db.appointment.findMany({
    orderBy: { proposedAt: "desc" },
    include: { user: { include: { profile: true } } },
  });
}

export function confirm(id: string, scheduledAt: Date) {
  return db.appointment.update({
    where: { id },
    data: { status: "CONFIRME", scheduledAt },
  });
}

export function reschedule(id: string, scheduledAt: Date) {
  return db.appointment.update({
    where: { id },
    data: { status: "CONFIRME", scheduledAt },
  });
}

export function cancel(id: string) {
  return db.appointment.update({
    where: { id },
    data: { status: "ANNULE", cancelledAt: new Date() },
  });
}

export function complete(id: string) {
  return db.appointment.update({
    where: { id },
    data: { status: "TERMINE", completedAt: new Date() },
  });
}
