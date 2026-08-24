"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Formulaire Seuil : crée un niveau dans un cursus. Même pattern que les
// autres formulaires "Ajouter X" du Seuil — voir AddCourseForm.
export function AddLevelForm({ cursusId }: { cursusId: string }) {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/cursus/${cursusId}/levels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: Number(number),
        name,
        nameEn: nameEn || undefined,
      }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setNumber("");
    setName("");
    setNameEn("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Ajouter un niveau</p>
      <Input
        label="Numéro (1-9)"
        type="number"
        min={1}
        max={9}
        required
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      <Input
        label="Nom"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="Nom (anglais)"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}
