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

  async function onClick() {
    setPending(true);
    await fetch(endpoint, { method });
    setPending(false);
    router.refresh();
  }

  return (
    <Button variant={variant} onClick={onClick} disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}
