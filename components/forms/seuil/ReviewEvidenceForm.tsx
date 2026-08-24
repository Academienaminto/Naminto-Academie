"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** La correction et le score restent calculés côté serveur (§9 RÈGLES DU
 * QUIZ) : ce formulaire ne transmet qu'une décision et un commentaire
 * optionnel, jamais un score. */
export function ReviewEvidenceForm({ evidenceId }: { evidenceId: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState<"APPROUVE" | "REFUSE" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(decision: "APPROUVE" | "REFUSE") {
    setPending(decision);
    setError(null);
    const res = await fetch(`/api/v1/evidence/${evidenceId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment: comment || undefined }),
    });
    const result = await res.json();
    setPending(null);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <textarea
        placeholder="Commentaire (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
        rows={2}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={() => review("APPROUVE")}
          disabled={pending !== null}
        >
          {pending === "APPROUVE" ? "…" : "Approuver"}
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => review("REFUSE")}
          disabled={pending !== null}
        >
          {pending === "REFUSE" ? "…" : "Refuser"}
        </Button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
