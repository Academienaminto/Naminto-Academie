import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getMember } from "@/modules/members/service";
import { MemberActionButton } from "@/components/forms/seuil/MemberActionButton";

const STATUS_LABELS: Record<string, string> = {
  ACTIF: "Actif",
  BLOQUE: "Bloqué",
  BANNI: "Banni",
  EN_SUPPRESSION: "En suppression",
  SUPPRIME: "Supprimé",
};

// Fiche d'un membre : identité, rôles, compteurs, actions de modération
// (ESPACE DU SEUIL §9-16) et historique récent. Les boutons affichés
// dépendent de l'état du compte (ex. "Bloquer" seulement si ACTIF,
// "Restaurer" seulement si EN_SUPPRESSION) — les routes API appelées par
// MemberActionButton revérifient elles-mêmes ces transitions (voir
// modules/members/service.ts assertNotSeuil : un compte Seuil ne peut pas
// être bloqué/banni/supprimé par cette interface).
export default async function SeuilMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let member;
  try {
    member = await getMember(id);
  } catch (err) {
    // AppError RESOURCE_NOT_FOUND -> 404 Next.js.
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  const status = member.account?.status ?? "ACTIF";
  const name =
    member.profile?.displayName ||
    [member.profile?.firstName, member.profile?.lastName].filter(Boolean).join(" ") ||
    member.email;

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text">{name}</h1>
        <p className="text-sm text-text-muted">
          {member.email} {member.phone ? `— ${member.phone}` : ""}
        </p>
        <p className="text-sm text-text-muted">
          Rôles : {member.roles.map((r) => r.role.name).join(", ") || "aucun"}
        </p>
        <p className="text-sm text-text-muted">
          {member._count.enrollments} inscription(s) — {member._count.orders} commande(s)
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
        <p className="text-sm font-medium text-text">
          État du compte : <span className="text-accent">{STATUS_LABELS[status] ?? status}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {status === "ACTIF" && (
            <MemberActionButton
              endpoint={`/api/v1/members/${member.id}/block`}
              label="Bloquer"
              variant="secondary"
            />
          )}
          {status === "BLOQUE" && (
            <MemberActionButton
              endpoint={`/api/v1/members/${member.id}/unblock`}
              label="Débloquer"
              variant="secondary"
            />
          )}
          {(status === "ACTIF" || status === "BLOQUE") && (
            <MemberActionButton
              endpoint={`/api/v1/members/${member.id}/ban`}
              label="Bannir"
              variant="danger"
              confirmMessage="Bannir ce membre ? Cette action est administrative et distincte d'un simple blocage."
            />
          )}
          {(status === "ACTIF" || status === "BLOQUE") && (
            <MemberActionButton
              endpoint={`/api/v1/members/${member.id}/delete`}
              label="Supprimer le compte"
              variant="danger"
              confirmMessage="Supprimer ce compte ? Il restera restaurable pendant 30 jours."
            />
          )}
          {status === "EN_SUPPRESSION" && (
            <MemberActionButton
              endpoint={`/api/v1/members/${member.id}/restore`}
              label="Restaurer le compte"
              variant="secondary"
            />
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
        <p className="text-sm font-medium text-text">Historique récent</p>
        <ul className="flex flex-col gap-1">
          {member.recentEvents.map((event) => (
            <li key={event.id} className="text-xs text-text-muted">
              {new Date(event.createdAt).toLocaleString("fr-FR")} — {event.type}
            </li>
          ))}
          {member.recentEvents.length === 0 && (
            <p className="text-xs text-text-muted">Aucun événement enregistré.</p>
          )}
        </ul>
      </section>
    </main>
  );
}
