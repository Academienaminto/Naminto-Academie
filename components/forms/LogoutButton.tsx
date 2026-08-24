"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { logoutRequest } from "@/lib/api/auth";

// Bouton de déconnexion générique, réutilisé dans les navs membre et Seuil.
export function LogoutButton({ label = "Se déconnecter" }: { label?: string }) {
  const router = useRouter();

  async function onClick() {
    await logoutRequest();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <Button variant="tertiary" onClick={onClick}>
      {label}
    </Button>
  );
}
