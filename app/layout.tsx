// Layout racine (App Router) : charge les polices Google (Fraunces/Inter),
// pose le <html>/<body> partagés par toutes les routes (publiques, auth,
// membre, seuil…) et importe globals.css. Composant serveur — pas de
// logique de session ni de garde d'accès ici, voir les layouts de chaque
// groupe de routes pour ça (ex. app/(membre)/layout.tsx).
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Naminto Académie",
  description: "Naminto Académie — cursus initiatique et formations en ligne.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text">
        {children}
      </body>
    </html>
  );
}
