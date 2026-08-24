"use client";

import { useState } from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
}

// DESIGN SYSTEM §44 MOBILE : la sidebar fixe (toujours visible en desktop)
// écraserait le contenu sur un écran mobile — repliée en tiroir ici.
export function SeuilMobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border bg-surface md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-heading text-sm uppercase tracking-[0.3em] text-accent">
          Le Seuil
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Ouvrir le menu du Seuil"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md border border-border"
        >
          <span className="h-0.5 w-5 bg-text" />
          <span className="h-0.5 w-5 bg-text" />
          <span className="h-0.5 w-5 bg-text" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-text hover:bg-background"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/membre"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-background hover:text-text"
          >
            ← Espace membre
          </Link>
        </nav>
      )}
    </div>
  );
}
