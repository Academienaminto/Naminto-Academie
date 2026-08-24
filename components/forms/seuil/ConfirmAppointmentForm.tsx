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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    await fetch(`/api/v1/appointments/${appointmentId}/confirm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: new Date(scheduledAt).toISOString() }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-sm text-text outline-none focus:border-accent"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "…" : "Confirmer"}
      </Button>
    </form>
  );
}
