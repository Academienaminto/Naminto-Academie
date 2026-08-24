import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";

// Layout du groupe de routes (public) — header + footer communs aux pages
// vitrine (accueil, cursus, formations, blog, bibliothèque, documents…).
// PublicHeader lit la session via cookies() pour adapter la nav (visiteur
// vs membre connecté) : c'est ce qui force ces pages en rendu dynamique,
// voir la note dans app/(public)/cursus/page.tsx.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <PublicFooter />
    </div>
  );
}
