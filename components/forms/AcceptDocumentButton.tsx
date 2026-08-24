"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AcceptDocumentButton({
  versionId,
  alreadyAccepted,
  t,
}: {
  versionId: string;
  alreadyAccepted: boolean;
  t: Dictionary["documentsPage"];
}) {
  const [accepted, setAccepted] = useState(alreadyAccepted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAccept() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/documents/versions/${versionId}/accept`, {
      method: "POST",
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setAccepted(true);
  }

  if (accepted) {
    return <p className="text-sm text-success">{t.accepted}</p>;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={onAccept} disabled={pending}>
        {pending ? t.accepting : t.accept}
      </Button>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
