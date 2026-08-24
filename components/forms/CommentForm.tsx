"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CommentForm({
  postId,
  t,
}: {
  postId: string;
  t: Dictionary["blogPost"];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/blog/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      if (result.error.code === "AUTH_REQUIRED") {
        router.push("/connexion");
        return;
      }
      setError(result.error.message);
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder={t.commentPlaceholder}
        className="rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.commentSubmitting : t.commentSubmit}
      </Button>
    </form>
  );
}
