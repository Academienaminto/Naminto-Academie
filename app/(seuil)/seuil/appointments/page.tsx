import { listAll } from "@/modules/appointments/service";
import { ConfirmAppointmentForm } from "@/components/forms/seuil/ConfirmAppointmentForm";
import { ActionButton } from "@/components/forms/seuil/ActionButton";

// Liste tous les rendez-vous, tous membres confondus (pas de filtrage par
// canManageAll ici : listAll() côté service n'est appelé que par le Seuil).
// PROPOSE -> confirmer (ConfirmAppointmentForm, qui ajuste éventuellement
// la date) ou annuler ; CONFIRME -> clôturer ou annuler (ActionButton,
// simple appel sans corps de requête).
export default async function SeuilAppointmentsPage() {
  const appointments = await listAll();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        Rendez-vous
      </h1>

      <ul className="flex flex-col gap-3">
        {appointments.map((appointment) => (
          <li
            key={appointment.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-text">
                Proposé pour le{" "}
                {new Date(appointment.proposedAt).toLocaleString("fr-FR")}
              </p>
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {appointment.status}
              </p>
            </div>
            {appointment.status === "PROPOSE" && (
              <div className="flex items-center gap-2">
                <ConfirmAppointmentForm
                  appointmentId={appointment.id}
                  proposedAt={appointment.proposedAt.toISOString()}
                />
                <ActionButton
                  endpoint={`/api/v1/appointments/${appointment.id}/cancel`}
                  label="Annuler"
                  variant="danger"
                />
              </div>
            )}
            {appointment.status === "CONFIRME" && (
              <div className="flex items-center gap-2">
                <ActionButton
                  endpoint={`/api/v1/appointments/${appointment.id}/complete`}
                  label="Clôturer"
                />
                <ActionButton
                  endpoint={`/api/v1/appointments/${appointment.id}/cancel`}
                  label="Annuler"
                  variant="danger"
                />
              </div>
            )}
          </li>
        ))}
        {appointments.length === 0 && (
          <p className="text-text-muted">Aucun rendez-vous.</p>
        )}
      </ul>
    </main>
  );
}
