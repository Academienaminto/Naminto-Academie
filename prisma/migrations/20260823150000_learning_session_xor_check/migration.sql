-- Garantit au niveau base qu'une LearningSession appartient à exactement
-- un regroupement (cours du cursus OU partie de formation), jamais aucun,
-- jamais les deux. Les deux contraintes d'unicité existantes reposent déjà
-- sur cette hypothèse (NULL distinct de NULL en PostgreSQL) mais ne
-- l'imposaient pas : une ligne avec course_id ET formation_part_id à NULL
-- serait passée inaperçue, et les index uniques ne l'empêchent pas puisque
-- NULL n'est jamais égal à NULL. Une anomalie de ce type (deux colonnes à
-- NULL) a été observée une fois lors des tests E2E du 23/08/2026, sans
-- source applicative reproductible identifiée malgré une revue exhaustive
-- de tous les points d'écriture — probablement un artefact du serveur de
-- développement (Turbopack) pendant une compaction de cache concurrente,
-- pas un bug métier. Cette contrainte rend l'état invalide impossible à
-- persister, quelle qu'en soit la cause.
ALTER TABLE "learning_sessions"
  ADD CONSTRAINT "learning_sessions_course_xor_formation_part"
  CHECK (
    (course_id IS NOT NULL AND formation_part_id IS NULL)
    OR
    (course_id IS NULL AND formation_part_id IS NOT NULL)
  );
