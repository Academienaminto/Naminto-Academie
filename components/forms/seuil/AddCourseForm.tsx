"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AddCourseForm({ levelId }: { levelId: string }) {
  const router = useRouter();
  const [position, setPosition] = useState("");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/v1/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        levelId,
        position: Number(position),
        title,
        titleEn: titleEn || undefined,
        price: price ? Number(price) : undefined,
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
    setPrice("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <Input
        label="Position (1-6)"
        type="number"
        min={1}
        max={6}
        required
        className="w-28"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
      />
      <Input
        label="Titre du cours"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Titre (anglais)"
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
      />
      <Input
        label="Prix (XOF, vide = gratuit)"
        type="number"
        min={0}
        className="w-40"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "…" : "Ajouter le cours"}
      </Button>
      {error && <p className="w-full text-sm text-error">{error}</p>}
    </form>
  );
}
