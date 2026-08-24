"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DownloadCourseButton({
  courseId,
  label,
  pendingLabel,
}: {
  courseId: string;
  label: string;
  pendingLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/courses/${courseId}/download`);
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="secondary" onClick={onClick} disabled={pending}>
        {pending ? pendingLabel : label}
      </Button>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
