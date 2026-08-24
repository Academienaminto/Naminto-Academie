-- CreateIndex
CREATE UNIQUE INDEX "learning_sessions_user_id_course_id_session_number_key" ON "learning_sessions"("user_id", "course_id", "session_number");

-- CreateIndex
CREATE UNIQUE INDEX "learning_sessions_user_id_formation_part_id_session_number_key" ON "learning_sessions"("user_id", "formation_part_id", "session_number");
