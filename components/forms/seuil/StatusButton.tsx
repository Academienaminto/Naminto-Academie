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
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant={variant} onClick={onClick} disabled={pending}>
        {pending ? "…" : label}
      </Button>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
