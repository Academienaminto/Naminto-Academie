"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Formulaire Seuil : crée une partie dans une formation. Même pattern que
// les autres formulaires "Ajouter X" du Seuil — voir AddCourseForm.
export function AddFormationPartForm({ formationId }: { formationId: string }) {
  const router = useRouter();
  const [position, setPosition] = useState("");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/formations/${formationId}/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        position: Number(position),
        title,
        titleEn: titleEn || undefined,
      }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setPosition("");
    setTitle("");
    setTitleEn("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Ajouter une partie</p>
      <Input
        label="Position"
        type="number"
        min={1}
        required
        value={position}
        onChange={(e) => setPosition(e.target.value)}
      />
      <Input
        label="Titre"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Titre (anglais)"
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}
