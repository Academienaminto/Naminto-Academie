import { db } from "@/lib/db";

// Tableau de bord : quelques compteurs agrégés en lecture directe via
// Prisma (pas de module de service dédié, ces chiffres ne portent aucune
// règle métier à appliquer).
export default async function SeuilDashboardPage() {
  const [users, enrollments, orders, conversations, appointments, posts] =
    await Promise.all([
      db.user.count(),
      db.enrollment.count(),
      db.order.count({ where: { status: "PAYEE" } }),
      db.conversation.count({ where: { status: "OUVERTE" } }),
      db.appointment.count({ where: { status: "PROPOSE" } }),
      db.blogPost.count({ where: { status: "PUBLIE" } }),
    ]);

  const stats = [
    { label: "Utilisateurs", value: users },
    { label: "Inscriptions au cursus", value: enrollments },
    { label: "Commandes payées", value: orders },
    { label: "Conversations ouvertes", value: conversations },
    { label: "Rendez-vous en attente", value: appointments },
    { label: "Articles publiés", value: posts },
  ];

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        Tableau de bord
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <p className="text-3xl font-semibold text-text">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
