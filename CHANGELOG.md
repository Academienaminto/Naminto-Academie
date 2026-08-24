# Changelog

Toutes les évolutions notables de ce projet sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) —
ARCHITECTURE DE MAINTENANCE §41.

## [Non publié]

### Ajouté
- Suppression et restauration de compte en libre-service par le membre
  (RÈGLES MÉTIER §6-7) — `POST /api/v1/account/delete`,
  `POST /api/v1/account/restore`, option de restauration directement
  depuis le formulaire de connexion.
- Page Profil/Paramètres membre (`/membre/parametres`) : préférences de
  notification, suppression de compte.
- Centre de notifications avec compteur de non-lues et marquage lu
  (`app/(membre)/membre/page.tsx`, `components/forms/NotificationList.tsx`).
- Page de contact publique (`/contact`) pour les visiteurs non connectés.
- Endpoint de santé `GET /api/v1/health` (API + base de données).
- Workflow CI GitHub Actions (`.github/workflows/ci.yml`) : lint → type
  check → tests → build.
- Déclencheur planifié externe pour le traitement des délais
  (`.github/workflows/deadlines-cron.yml`), remplaçant l'absence de
  worker en tâche de fond.
- i18n complète du chrome d'interface ET du contenu métier (titres de
  cursus/cours/formations/quiz/questions/réponses, articles de blog) en
  anglais, avec repli français si une traduction manque — portée limitée
  à l'espace public/membre, l'espace Seuil reste français uniquement.
- Messages d'erreur serveur traduits pour les routes publiques/membre.
- Suite de tests E2E Playwright (inscription/connexion, parcours Seuil →
  membre complet d'un quiz).
- Interface Seuil de gestion des quiz (création, questions, publication).
- Administration des membres (recherche, blocage/déblocage/bannissement/
  suppression/restauration), journal d'audit distinct du journal
  d'événements.
- Intégration du prestataire de paiement Adullam en complément de
  CinetPay.

### Changé
- `LearningSession.courseId`/`formationPartId` : passés de `ON DELETE
  SET NULL` à `ON DELETE CASCADE`, plus une contrainte `CHECK` empêchant
  les deux colonnes d'être `NULL` simultanément (état invalide découvert
  lors des tests E2E — voir historique Git pour le détail du diagnostic).

### Retiré
- Dépendances `socket.io`, `socket.io-client`, `bullmq`, `ioredis` du
  `package.json` : déclarées mais jamais câblées à une fonctionnalité
  réelle. Le traitement planifié des délais utilise désormais un
  déclencheur cron externe plutôt qu'une file de tâches interne. À
  réintroduire seulement si un vrai besoin (temps réel, file de tâches)
  apparaît.

## Avant le suivi de ce fichier

Le socle du projet (authentification, cursus, formations, bibliothèque,
blog, quiz, progression pédagogique, rendez-vous, messagerie,
notifications, paiements CinetPay, stockage de fichiers, délais, design
system, responsive, sécurité de base) a été construit avant l'introduction
de ce fichier — voir l'historique Git pour le détail commit par commit.
