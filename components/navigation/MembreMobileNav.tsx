"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/forms/LogoutButton";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Même principe que MobileNav (espace public) — DESIGN SYSTEM §44 MOBILE :
// éviter qu'une longue rangée de liens (Cursus, Formations, Bibliothèque,
// Blog, Rendez-vous, Paramètres, Le Seuil) ne s'empile sur plusieurs lignes
// et repousse le contenu sur mobile.
export function MembreMobileNav({
  t,
  isSeuil,
}: {
  t: Dictionary["nav"];
  isSeuil: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t.ouvrirMenu}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md border border-border"
      >
        <span className="h-0.5 w-5 bg-text" />
        <span className="h-0.5 w-5 bg-text" />
        <span className="h-0.5 w-5 bg-text" />
      </button>

      {open && (
        <nav className="absolute right-0 top-full z-10 mt-2 flex w-56 flex-col gap-1 rounded-md border border-border bg-background p-3 text-sm text-text shadow-lg">
          <Link href="/cursus" className="rounded-md px-2 py-2 hover:bg-surface">
            {t.cursus}
          </Link>
          <Link href="/formations" className="rounded-md px-2 py-2 hover:bg-surface">
            {t.formations}
          </Link>
          <Link href="/bibliotheque" className="rounded-md px-2 py-2 hover:bg-surface">
            {t.bibliotheque}
          </Link>
          <Link href="/blog" className="rounded-md px-2 py-2 hover:bg-surface">
            {t.blog}
          </Link>
          <Link href="/membre/rendez-vous" className="rounded-md px-2 py-2 hover:bg-surface">
            {t.rendezVous}
          </Link>
          <Link href="/membre/messages" className="rounded-md px-2 py-2 hover:bg-surface">
            {t.messages}
          </Link>
          <Link href="/membre/parametres" className="rounded-md px-2 py-2 hover:bg-surface">
            {t.parametres}
          </Link>
          {isSeuil && (
            <Link
              href="/seuil"
              className="rounded-md px-2 py-2 text-accent hover:bg-surface"
            >
              {t.leSeuil}
            </Link>
          )}
          <div className="mt-1 border-t border-border pt-2">
            <LogoutButton label={t.deconnexion} />
          </div>
        </nav>
      )}
    </div>
  );
}
