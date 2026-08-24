"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ActionButtonProps {
  endpoint: string;
  method?: "PATCH" | "POST";
  label: string;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
}

/** Bouton générique pour une action sans corps de requête (annuler,
 * clôturer, etc.). */
export function ActionButton({
  endpoint,
  method = "PATCH",
  label,
  variant = "tertiary",
}: ActionButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const res = await fetch(endpoint, { method });
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
