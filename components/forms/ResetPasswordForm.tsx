"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resetPasswordRequest } from "@/lib/api/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Lit le token de réinitialisation dans l'URL via useSearchParams() : le
// composant parent (page) doit l'envelopper dans un <Suspense>, sinon Next
// échoue au build/SSR.
export function ResetPasswordForm({ t }: { t: Dictionary["resetPasswordPage"] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t.mismatch);
      return;
    }
    if (!token) {
      setError(t.invalid);
      return;
    }
    setPending(true);
    const result = await resetPasswordRequest({ token, password });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    router.push(result.data.isSeuil ? "/seuil" : "/membre");
    router.refresh();
  }

  if (!token) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-2 text-center">
        <p className="text-sm text-error">{t.invalid}</p>
        <Link href="/mot-de-passe-oublie" className="text-sm text-accent hover:underline">
          {t.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <Input
        label={t.newPassword}
        type="password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label={t.confirmPassword}
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        minLength={8}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
