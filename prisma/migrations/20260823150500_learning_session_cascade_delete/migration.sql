-- Racine du bug de LearningSession orpheline (course_id ET
-- formation_part_id à NULL) observé lors des tests E2E du 23/08/2026 :
-- les deux clés étrangères ci-dessous utilisaient ON DELETE SET NULL, la
-- valeur par défaut que Prisma applique à une relation optionnelle quand
-- aucune action n'est précisée. Si un Course (ou FormationPart) est
-- supprimé pendant qu'une LearningSession le référence encore, Postgres
-- mettait alors course_id à NULL de son côté sans jamais toucher
-- formation_part_id (qui était déjà NULL) — produisant exactement l'état
-- invalide que la CHECK constraint de la migration précédente rejette
-- désormais. Une LearningSession n'a de sens que rattachée à un cours ou
-- une partie de formation existant·e : si celui-ci/celle-ci disparaît,
-- la séance doit disparaître avec, pas devenir orpheline.
ALTER TABLE "learning_sessions" DROP CONSTRAINT "learning_sessions_course_id_fkey";
ALTER TABLE "learning_sessions"
  ADD CONSTRAINT "learning_sessions_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learning_sessions" DROP CONSTRAINT "learning_sessions_formation_part_id_fkey";
ALTER TABLE "learning_sessions"
  ADD CONSTRAINT "learning_sessions_formation_part_id_fkey"
  FOREIGN KEY ("formation_part_id") REFERENCES "formation_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
