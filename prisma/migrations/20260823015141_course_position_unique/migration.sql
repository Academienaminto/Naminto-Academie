-- CreateIndex
CREATE UNIQUE INDEX "courses_level_id_position_key" ON "courses"("level_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "courses_formation_part_id_position_key" ON "courses"("formation_part_id", "position");

