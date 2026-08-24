"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Upload en deux temps : le fichier part d'abord vers le stockage
 * générique (POST /api/v1/files), puis son identifiant est rattaché au
 * cours comme nouvelle version (POST /api/v1/courses/[id]/versions) —
 * même principe que modules/books, désormais avec un vrai sélecteur de
 * fichier plutôt qu'une saisie manuelle de File.id. */
export function UploadCourseFileForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choisissez un fichier.");
      return;
    }
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/v1/files", {
      method: "POST",
      body: formData,
    });
    const uploaded = await uploadRes.json();
    if (!uploaded.success) {
      setPending(false);
      setError(uploaded.error.message);
      return;
    }

    const versionRes = await fetch(`/api/v1/courses/${courseId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: uploaded.data.id }),
    });
    const version = await versionRes.json();
    setPending(false);
    if (!version.success) {
      setError(version.error.message);
      return;
    }
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Ajouter le matériel du cours</p>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        className="text-sm text-text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:text-text"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending || !fileName}>
        {pending ? "Envoi…" : "Uploader"}
      </Button>
    </form>
  );
}
