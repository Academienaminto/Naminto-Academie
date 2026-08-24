"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AddDocumentVersionForm({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("fr");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/documents/${documentId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, language }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Ajouter une nouvelle version</p>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-text-muted">Langue</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-text-muted">Contenu</label>
        <textarea
          required
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Ajout…" : "Ajouter la version"}
      </Button>
    </form>
  );
}
