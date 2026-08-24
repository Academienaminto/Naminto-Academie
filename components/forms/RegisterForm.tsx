"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerRequest } from "@/lib/api/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function RegisterForm({
  t,
  tAuth,
}: {
  t: Dictionary["register"];
  tAuth: Dictionary["auth"];
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await registerRequest({
      email,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    // §72 : aucune session n'est créée à l'inscription — le compte n'est
    // actif qu'après clic sur le lien reçu par email (voir /verification-email).
    setRegistered(true);
  }

  if (registered) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-2 text-center">
        <p className="font-heading text-lg font-semibold text-text">
          {t.checkEmailTitle}
        </p>
        <p className="text-sm text-text-muted">{t.checkEmailMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t.firstName}
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          label={t.lastName}
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <Input
        label={tAuth.email}
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label={tAuth.password}
        type="password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
