"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailRequest } from "@/lib/api/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function VerifyEmailStatus({ t }: { t: Dictionary["verifyEmailPage"] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error",
  );
  // Un token de vérification est à usage unique : le protège du double
  // déclenchement de l'effet en développement (React StrictMode), qui
  // enverrait sinon deux requêtes réseau pour le même token.
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;
    verifyEmailRequest(token).then((result) => {
      if (!result.success) {
        setStatus("error");
        return;
      }
      setStatus("success");
      router.push(result.data.isSeuil ? "/seuil" : "/membre");
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2 text-center">
      {status === "verifying" && <p className="text-text-muted">{t.verifying}</p>}
      {status === "success" && <p className="text-success">{t.success}</p>}
      {status === "error" && (
        <>
          <p className="text-error">{t.invalid}</p>
          <Link href="/connexion" className="text-sm text-accent hover:underline">
            {t.backToLogin}
          </Link>
        </>
      )}
    </div>
  );
}
