"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// Ouvre un fichier déjà uploadé (URL signée retournée par le serveur) dans
// un nouvel onglet — équivalent Seuil de DownloadCourseButton.
export function ViewFileButton({ fileId, label }: { fileId: string; label: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/files/${fileId}/download`);
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="tertiary" onClick={onClick} disabled={pending}>
        {pending ? "…" : label}
      </Button>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
