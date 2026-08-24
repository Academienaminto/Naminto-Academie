"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  "/images/hero-1.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
];

const INTERVAL_MS = 6000;

// Carrousel client de la page d'accueil : défilement automatique des images
// SLIDES + navigation manuelle via les puces. L'effet nettoie son
// setInterval au démontage, sûr en StrictMode (double montage dev).
export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-surface sm:aspect-[21/9]">
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Naminto Académie"
          fill
          priority={i === 0}
          sizes="(max-width: 768px) 100vw, 1024px"
          className={`object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Image ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? "bg-accent" : "bg-text/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
