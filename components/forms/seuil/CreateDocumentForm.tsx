"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const DOCUMENT_TYPES = [
  { value: "FAQ", label: "FAQ" },
  { value: "CONFIDENTIALITE", label: "Confidentialité" },
  { value: "STATUT", label: "Statut" },
  { value: "REGLEMENT_INTERIEUR", label: "Règlement intérieur" },
  { value: "REGLES_PEDAGOGIQUES", label: "Règles pédagogiques" },
  { value: "REGLES_DES_DELAIS", label: "Règles des délais" },
  { value: "REGLES_DES_SEANCES", label: "Règles des séances" },
  { value: "MISE_EN_GARDE", label: "Mise en garde" },
];

const DOCUMENT_CATEGORIES = [
  { value: "NON_APPLICABLE", label: "Non applicable" },
  { value: "GENERALE", label: "Générale" },
  { value: "CURSUS", label: "Cursus" },
  { value: "FORMATIONS", label: "Formations" },
  { value: "COURS", label: "Cours" },
  { value: "PAIEMENTS", label: "Paiements" },
];

// Formulaire Seuil : crée un document réglementaire. La catégorie n'a de
// sens que pour le type FAQ (qui regroupe plusieurs catégories sur une
// seule page publique, cf. SingleDocumentPage/app/(public)/faq) — forcée à
// NON_APPLICABLE pour tous les autres types.
export function CreateDocumentForm() {
  const router = useRouter();
  const [type, setType] = useState("FAQ");
  const [category, setCategory] = useState("GENERALE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/v1/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        category: type === "FAQ" ? category : "NON_APPLICABLE",
        title,
        description: description || undefined,
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
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Nouveau document</p>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-text-muted">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      {type === "FAQ" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-muted">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <Input
        label="Titre"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer"}
      </Button>
    </form>
  );
}
