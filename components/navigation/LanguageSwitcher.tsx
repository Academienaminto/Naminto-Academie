"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

// Bascule FR/EN : POST la locale choisie (persistée côté serveur, cf.
// /api/v1/locale) puis router.refresh() pour re-rendre les Server Components
// avec le nouveau dictionnaire. Ne gère pas d'état d'erreur — best effort.
export function LanguageSwitcher({
  current,
  t,
}: {
  current: Locale;
  t: Dictionary["language"];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function switchTo(locale: Locale) {
    if (locale === current || pending) return;
    setPending(true);
    await fetch("/api/v1/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs" aria-label={t.label}>
      <button
        type="button"
        onClick={() => switchTo("fr")}
        aria-pressed={current === "fr"}
        className={current === "fr" ? "text-accent" : "text-text-muted hover:text-text"}
      >
        FR
      </button>
      <span className="text-text-muted">/</span>
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={current === "en"}
        className={current === "en" ? "text-accent" : "text-text-muted hover:text-text"}
      >
        EN
      </button>
    </div>
  );
}
