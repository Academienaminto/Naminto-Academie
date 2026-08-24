"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { enrollRequest } from "@/lib/api/enrollment";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Inscription à un cursus. Sur AUTH_REQUIRED, redirige vers /connexion
// plutôt que d'afficher une erreur générique — voir aussi
// EnrollFormationButton et CommentForm pour le même pattern.
export function EnrollButton({
  cursusId,
  t,
}: {
  cursusId: string;
  t: Dictionary["cursusPage"];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = await enrollRequest(cursusId);
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
