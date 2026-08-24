"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { forgotPasswordRequest } from "@/lib/api/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ForgotPasswordForm({ t }: { t: Dictionary["forgotPasswordPage"] }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await forgotPasswordRequest(email);
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    // §28/§31 : la réponse ne distingue jamais un compte existant d'un
    // compte inexistant — ce message s'affiche dans tous les cas.
    setSent(true);
  }

  if (sent) {
    return (
      <p className="w-full max-w-sm text-center text-sm text-text-muted">
        {t.checkEmailMessage}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm text-text-muted">{t.intro}</p>
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
