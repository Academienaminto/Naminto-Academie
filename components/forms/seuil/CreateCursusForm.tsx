"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Formulaire Seuil : crée un cursus. Même pattern que les autres
// formulaires "Créer/Ajouter X" du Seuil — voir AddCourseForm.
export function CreateCursusForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/v1/cursus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        titleEn: titleEn || undefined,
        descriptionEn: descriptionEn || undefined,
      }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setTitle("");
    setDescription("");
    setTitleEn("");
    setDescriptionEn("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Nouveau cursus</p>
      <Input
        label="Titre"
        name="title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Description"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label="Titre (anglais)"
        name="titleEn"
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
      />
      <Input
        label="Description (anglais)"
        name="descriptionEn"
        value={descriptionEn}
        onChange={(e) => setDescriptionEn(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer"}
      </Button>
    </form>
  );
}
