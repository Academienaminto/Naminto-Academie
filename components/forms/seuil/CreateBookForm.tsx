"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Formulaire Seuil : crée un livre (gratuit ou payant). Même pattern que
// les autres formulaires "Créer/Ajouter X" du Seuil — voir AddCourseForm.
export function CreateBookForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/v1/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author: author || undefined,
        description: description || undefined,
        titleEn: titleEn || undefined,
        descriptionEn: descriptionEn || undefined,
        isFree,
        price: isFree ? undefined : Number(price),
      }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setTitle("");
    setAuthor("");
    setDescription("");
    setTitleEn("");
    setDescriptionEn("");
    setPrice("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Nouveau livre</p>
      <Input
        label="Titre"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Auteur"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label="Titre (anglais)"
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
      />
      <Input
        label="Description (anglais)"
        value={descriptionEn}
        onChange={(e) => setDescriptionEn(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
        />
        Livre gratuit
      </label>
      {!isFree && (
        <Input
          label="Prix (XOF)"
          type="number"
          min={0}
          required={!isFree}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer"}
      </Button>
    </form>
  );
}
