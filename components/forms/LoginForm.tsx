"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginRequest, restoreOwnAccountRequest, resendVerificationRequest } from "@/lib/api/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function LoginForm({ t }: { t: Dictionary["auth"] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState(false);
  const [restored, setRestored] = useState(false);
  const [pending, setPending] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPendingDeletion(false);
    setRestored(false);
    setNotVerified(false);
    setResent(false);
    setPending(true);
    const result = await loginRequest({ email, password });
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      if (result.error.code === "ACCOUNT_PENDING_DELETION") {
        setPendingDeletion(true);
      }
      if (result.error.code === "EMAIL_NOT_VERIFIED") {
        setNotVerified(true);
      }
      return;
    }
    // Un compte du Seuil arrive directement dans son espace
    // d'administration plutôt que dans l'espace membre générique — un
    // clic de moins, jamais un contournement de l'authentification :
    // le mot de passe reste vérifié normalement par login() ci-dessus,
    // et chaque route /seuil revérifie elle-même le rôle côté serveur.
    router.push(result.data.isSeuil ? "/seuil" : "/membre");
    router.refresh();
  }

  async function onRestore() {
    setRestoring(true);
    setError(null);
    const result = await restoreOwnAccountRequest({ email, password });
    setRestoring(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setPendingDeletion(false);
    setRestored(true);
  }

  async function onResend() {
    setResending(true);
    setError(null);
    const result = await resendVerificationRequest(email);
    setResending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setResent(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <Input
        label={t.email}
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label={t.password}
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {restored && <p className="text-sm text-success">{t.restoreAccountSuccess}</p>}
      {resent && <p className="text-sm text-success">{t.resendVerificationSuccess}</p>}
      {error && <p className="text-sm text-error">{error}</p>}
      {pendingDeletion ? (
        <Button type="button" variant="secondary" onClick={onRestore} disabled={restoring}>
          {restoring ? t.restoringAccount : t.restoreAccount}
        </Button>
      ) : notVerified ? (
        <Button type="button" variant="secondary" onClick={onResend} disabled={resending}>
          {resending ? t.resendingVerification : t.resendVerification}
        </Button>
      ) : (
        <Button type="submit" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
      )}
    </form>
  );
}
