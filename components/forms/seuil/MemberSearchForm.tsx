"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Barre de recherche des membres (Seuil) : pousse la requête dans l'URL
// (?q=...) plutôt que de fetch elle-même — la page /seuil/members lit ce
// paramètre côté serveur pour filtrer la liste. Lit aussi l'URL via
// useSearchParams() : le composant parent doit l'envelopper dans un
// <Suspense>, sinon Next échoue au build/SSR.
export function MemberSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(q ? `/seuil/members?q=${encodeURIComponent(q)}` : "/seuil/members");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <Input
        label="Rechercher (email, téléphone, nom)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full sm:w-72"
      />
      <Button type="submit">Rechercher</Button>
    </form>
  );
}
