"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ReplyForm({
  conversationId,
  placeholder = "Répondre…",
  sendLabel = "Envoyer",
  sendingLabel = "…",
}: {
  conversationId: string;
  placeholder?: string;
  sendLabel?: string;
  sendingLabel?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      // Message conservé dans le champ : un envoi refusé (conversation
      // fermée, session expirée...) ne doit jamais faire disparaître un
      // texte que l'utilisateur a déjà tapé.
      setError(result.error.message);
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1">
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent"
        />
        <Button type="submit" disabled={pending}>
          {pending ? sendingLabel : sendLabel}
        </Button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </form>
  );
}
