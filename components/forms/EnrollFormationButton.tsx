"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { enrollFormationRequest } from "@/lib/api/formations";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Inscription à une formation. Sur AUTH_REQUIRED, redirige vers /connexion
// plutôt que d'afficher une erreur générique — même pattern que
// EnrollButton (équivalent pour les cursus).
export function EnrollFormationButton({
  formationId,
  t,
}: {
  formationId: string;
  t: Dictionary["formationDetail"];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = await enrollFormationRequest(formationId);
    setPending(false);

    if (!result.success) {
      if (result.error.code === "AUTH_REQUIRED") {
        router.push("/connexion");
        return;
      }
      setError(result.error.message);
      return;
    }
    router.push("/membre");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={onClick} disabled={pending}>
        {pending ? t.enrolling : t.enroll}
      </Button>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
