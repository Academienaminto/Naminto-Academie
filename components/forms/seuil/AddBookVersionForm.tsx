"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** Le fichier doit déjà avoir été uploadé via POST /api/v1/files (module
 * Stockage) — il n'existe pas encore de sélecteur de fichier dans
 * l'interface, seul l'identifiant du File est demandé ici. */
export function AddBookVersionForm({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [fileId, setFileId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/books/${bookId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setFileId("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Ajouter une version</p>
      <Input
        label="Identifiant du fichier uploadé (File.id)"
        required
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Ajout…" : "Ajouter la version"}
      </Button>
    </form>
  );
}
