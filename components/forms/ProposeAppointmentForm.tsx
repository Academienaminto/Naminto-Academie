"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { proposeAppointmentRequest } from "@/lib/api/appointments";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ProposeAppointmentForm({ t }: { t: Dictionary["appointments"] }) {
  const router = useRouter();
  const [proposedAt, setProposedAt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await proposeAppointmentRequest({
      proposedAt: new Date(proposedAt).toISOString(),
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setProposedAt("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">{t.proposeTitle}</p>
      <input
        type="datetime-local"
        required
        value={proposedAt}
        onChange={(e) => setProposedAt(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? t.proposeSubmitting : t.proposeSubmit}
      </Button>
    </form>
  );
}
