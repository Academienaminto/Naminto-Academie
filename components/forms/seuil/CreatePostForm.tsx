"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CreatePostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/v1/blog/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        excerpt: excerpt || undefined,
        content,
        titleEn: titleEn || undefined,
        excerptEn: excerptEn || undefined,
        contentEn: contentEn || undefined,
      }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setTitle("");
    setExcerpt("");
    setContent("");
    setTitleEn("");
    setExcerptEn("");
    setContentEn("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">Nouvel article</p>
      <Input
        label="Titre"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Extrait"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-text-muted">Contenu</label>
        <textarea
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-text outline-none focus:border-accent"
        />
      </div>
      <Input
        label="Titre (anglais)"
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
      />
      <Input
        label="Extrait (anglais)"
        value={excerptEn}
        onChange={(e) => setExcerptEn(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-text-muted">Contenu (anglais)</label>
        <textarea
          rows={6}
          value={contentEn}
          onChange={(e) => setContentEn(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-text outline-none focus:border-accent"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer le brouillon"}
      </Button>
    </form>
  );
}
