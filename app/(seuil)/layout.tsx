import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { userHasRole } from "@/lib/auth/permissions";
import { SeuilMobileNav } from "@/components/navigation/SeuilMobileNav";

const NAV_ITEMS = [
  { href: "/seuil", label: "Tableau de bord" },
  { href: "/seuil/members", label: "Membres" },
  { href: "/seuil/cursus", label: "Cursus" },
  { href: "/seuil/formations", label: "Formations" },
  { href: "/seuil/books", label: "Bibliothèque" },
  { href: "/seuil/evidence", label: "Preuves pratiques" },
  { href: "/seuil/deadlines", label: "Délais" },
  { href: "/seuil/blog", label: "Blog" },
  { href: "/seuil/documents", label: "Documents" },
  { href: "/seuil/messages", label: "Messagerie" },
  { href: "/seuil/appointments", label: "Rendez-vous" },
  { href: "/seuil/audit", label: "Audit" },
];

// Vérification côté serveur uniquement (ARCHITECTURE GÉNÉRALE §70) : un
// compte membre ne doit jamais pouvoir accéder à l'espace du Seuil, même
// en devinant l'URL — cette garde s'exécute à chaque navigation.
export default async function SeuilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/connexion");
  }
  const isSeuil = await userHasRole(user.id, "SEUIL");
  if (!isSeuil) {
    redirect("/membre");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <SeuilMobileNav items={NAV_ITEMS} />
      <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4 md:flex">
        <p className="mb-4 font-heading text-sm uppercase tracking-[0.3em] text-accent">
          Le Seuil
        </p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm text-text hover:bg-background"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/membre"
          className="mt-4 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-background hover:text-text"
        >
          ← Espace membre
        </Link>
      </nav>
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
