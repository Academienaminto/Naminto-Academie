-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempts_user_id_quiz_id_attempt_number_key" ON "quiz_attempts"("user_id", "quiz_id", "attempt_number");
