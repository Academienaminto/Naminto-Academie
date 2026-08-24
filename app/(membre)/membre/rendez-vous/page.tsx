import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listMine } from "@/modules/appointments/service";
import { ProposeAppointmentForm } from "@/components/forms/ProposeAppointmentForm";
import { getDictionary } from "@/lib/i18n/locale";

export default async function MembreRendezVousPage() {
  const user = await getCurrentUser();
  const appointments = user ? await listMine(user.id) : [];
  const { t } = await getDictionary();

  const statusLabels: Record<string, string> = {
    PROPOSE: t.appointments.statusPropose,
    CONFIRME: t.appointments.statusConfirme,
    ANNULE: t.appointments.statusAnnule,
    TERMINE: t.appointments.statusTermine,
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-text">
          {t.appointments.title}
        </h1>
        <Link href="/membre" className="text-sm text-text-muted hover:text-accent">
          {t.appointments.back}
        </Link>
      </div>

      <ProposeAppointmentForm t={t.appointments} />

      <ul className="flex flex-col gap-3">
        {appointments.map((appointment) => (
          <li
            key={appointment.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
          >
            <span className="text-sm text-text">
              {new Date(
                appointment.scheduledAt ?? appointment.proposedAt,
              ).toLocaleString("fr-FR")}
            </span>
            <span className="text-xs uppercase tracking-wide text-text-muted">
              {statusLabels[appointment.status] ?? appointment.status}
            </span>
          </li>
        ))}
        {appointments.length === 0 && (
          <p className="text-text-muted">{t.appointments.empty}</p>
        )}
      </ul>
    </main>
  );
}
