"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface StatusButtonProps {
  endpoint: string;
  status: string;
  label: string;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
}

/** Bouton générique qui envoie { status } en PATCH à `endpoint`, utilisé
 * pour publier/dépublier/annuler quel que soit le domaine (cursus, cours,
 * blog, rendez-vous...). Évite de dupliquer ce pattern à chaque écran. */
export function StatusButton({
  endpoint,
  status,
  label,
  variant = "secondary",
}: StatusButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <Button variant={variant} onClick={onClick} disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}
