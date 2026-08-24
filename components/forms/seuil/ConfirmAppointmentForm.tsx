"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ConfirmAppointmentForm({
  appointmentId,
  proposedAt,
}: {
  appointmentId: string;
  proposedAt: string;
}) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState(proposedAt.slice(0, 16));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/appointments/${appointmentId}/confirm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: new Date(scheduledAt).toISOString() }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm text-text outline-none focus:border-accent"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "…" : "Confirmer"}
        </Button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </form>
  );
}
