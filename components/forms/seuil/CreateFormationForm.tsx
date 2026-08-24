"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CreateFormationForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/v1/formations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        titleEn: titleEn || undefined,
        descriptionEn: descriptionEn || undefined,
        price: price ? Number(price) : undefined,
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
    setPrice("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Nouvelle formation</p>
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
      <Input
        label="Prix (XOF, vide = gratuite)"
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer"}
      </Button>
    </form>
  );
}
