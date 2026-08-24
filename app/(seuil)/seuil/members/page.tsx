import Link from "next/link";
import { search } from "@/modules/members/service";
import { MemberSearchForm } from "@/components/forms/seuil/MemberSearchForm";

const STATUS_LABELS: Record<string, string> = {
  ACTIF: "Actif",
  BLOQUE: "Bloqué",
  BANNI: "Banni",
  EN_SUPPRESSION: "En suppression",
  SUPPRIME: "Supprimé",
};

const STATUS_CLASSES: Record<string, string> = {
  ACTIF: "text-success",
  BLOQUE: "text-warning",
  BANNI: "text-error",
  EN_SUPPRESSION: "text-warning",
  SUPPRIME: "text-text-muted",
};

export default async function SeuilMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const members = await search(q);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">Membres</h1>

      <MemberSearchForm />

      <ul className="flex flex-col gap-3">
        {members.map((member) => {
          const name =
            member.profile?.displayName ||
            [member.profile?.firstName, member.profile?.lastName].filter(Boolean).join(" ") ||
            member.email;
          const status = member.account?.status ?? "ACTIF";

          return (
            <li key={member.id}>
              <Link
                href={`/seuil/members/${member.id}`}
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 hover:border-accent sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-text">{name}</p>
                  <p className="truncate text-xs text-text-muted">{member.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-text-muted">
                    {member.roles.map((r) => r.role.name).join(", ")}
                  </span>
                  <span className={`text-xs uppercase tracking-wide ${STATUS_CLASSES[status] ?? ""}`}>
                    {STATUS_LABELS[status] ?? status}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
        {members.length === 0 && <p className="text-text-muted">Aucun membre trouvé.</p>}
      </ul>
    </main>
  );
}
