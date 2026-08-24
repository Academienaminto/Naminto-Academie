"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// DESIGN SYSTEM §44 MOBILE : navigation, contenu et action principale
// doivent rester accessibles sans défilement horizontal inutile — la
// navigation desktop (plusieurs liens en ligne) ne tient pas sur un écran
// mobile, d'où ce menu repliable.
export function MobileNav({
  loggedIn,
  t,
}: {
  loggedIn: boolean;
  t: Dictionary["nav"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
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
        <nav className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-border bg-background px-6 py-4 text-sm text-text">
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
          <Link href="/contact" className="rounded-md px-2 py-2 hover:bg-surface">
            {t.contact}
          </Link>
          {loggedIn ? (
            <Link href="/membre" className="rounded-md px-2 py-2 hover:bg-surface">
              {t.monEspace}
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="rounded-md px-2 py-2 hover:bg-surface">
                {t.connexion}
              </Link>
              <Link
                href="/inscription"
                className="mt-1 rounded-md bg-primary px-2 py-2 text-center text-text hover:opacity-90"
              >
                {t.rejoindre}
              </Link>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
