# Naminto Académie

Plateforme e-learning — cursus initiatique (9 niveaux × 6 cours), formations hors cursus,
bibliothèque, blog, messagerie, rendez-vous, espace membre, espace d'administration
(« le Seuil »).

Spécifications complètes : dossier parent `../` (documents Word — Architecture, Règles
Métier, Modèle de Données, Prompt Masters). Ce dépôt suit strictement ces documents.

## Stack

- **Frontend + Backend** : Next.js 16 (App Router, TypeScript strict)
- **Base de données** : PostgreSQL (Supabase) + Prisma
- **Authentification** : sessions serveur maison (cookie httpOnly + hash SHA-256, pas
  Auth.js — voir `lib/auth/session.ts` pour la justification) + argon2 pour les mots de
  passe
- **Fichiers** : Cloudflare R2 (S3-compatible)
- **Tâches planifiées** : déclencheur cron externe (GitHub Actions,
  `.github/workflows/deadlines-cron.yml`) plutôt qu'une file d'attente interne — aucune
  feature ne justifiait Redis/BullMQ à ce stade, retirés de `package.json` le 23/08/2026
- **Email** : Resend (non branché — canaux de contact actuels : WhatsApp/e-mail direct)
- **Paiement** : CinetPay + Adullam (cartes + monnaie électronique)
- **i18n** : chrome UI + contenu métier bilingues (fr/en) sur l'espace public/membre —
  l'espace Seuil reste français uniquement (voir `lib/i18n/dictionaries.ts`)
- **Tests** : Vitest (unitaire) + Playwright (E2E)
- **Style** : Tailwind CSS v4, tokens du Design System dans `app/globals.css`

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner DATABASE_URL, etc.
npm run db:generate
npm run db:migrate     # nécessite une base PostgreSQL accessible
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run db:migrate` | Migration Prisma (dev) |
| `npm run db:studio` | Interface Prisma Studio |

## Structure

```
app/
├── (public)/     routes publiques (accueil, cursus, formations, bibliothèque, blog, contact)
├── (auth)/       connexion, inscription
├── (membre)/     espace membre / apprenant (protégé)
├── (seuil)/      espace d'administration (protégé, français uniquement)
└── api/v1/       route handlers API, organisés par domaine

modules/          logique métier par domaine (service, repository, validation, types)
components/       composants UI réutilisables (ui, forms, navigation)
lib/              client Prisma, auth, i18n, événements, audit, sécurité, stockage
prisma/           schema.prisma, migrations
tests/            unit, e2e
.github/workflows/  CI (lint/typecheck/tests/build) + cron des délais
```

## État du projet

Fonctionnalités métier implémentées et vérifiées en conditions réelles (base Supabase
réelle, pas seulement des tests unitaires) : authentification (inscription, connexion,
suppression/restauration de compte en libre-service), cursus, formations, bibliothèque,
blog, quiz (3 types de question, preuve pratique revue par le Seuil), progression
pédagogique (passage de niveau, grades, séances), rendez-vous, messagerie, notifications
(préférences, centre de notifications avec marquage lu), paiements, administration des
membres, journal d'audit, i18n complète (chrome + contenu métier).

Non couvert / connu comme manquant :
- Contenu éditorial FAQ / politique de confidentialité / règlement intérieur en anglais
  (n'existe pas non plus en français dans le code — nécessite un vrai texte source, ne
  peut pas être inventé).
- URL de base réelle du prestataire de paiement Adullam (en attente du client).
- Temps réel (notifications poussées en direct) — aucun canal WebSocket câblé ; la
  fraîcheur des données passe par rechargement de page / `router.refresh()`.

Voir `CHANGELOG.md` pour l'historique des évolutions notables.
