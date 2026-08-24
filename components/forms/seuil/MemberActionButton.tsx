"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface MemberActionButtonProps {
  endpoint: string;
  label: string;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  /** ESPACE DU SEUIL §54 PROTECTION DES ACTIONS SENSIBLES : une
   * confirmation explicite est exigée pour bannir/supprimer. */
  confirmMessage?: string;
}

export function MemberActionButton({
  endpoint,
  label,
  variant = "secondary",
  confirmMessage,
}: MemberActionButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    setPending(true);
    setError(null);
    const res = await fetch(endpoint, { method: "PATCH" });
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
