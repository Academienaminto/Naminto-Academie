-- AlterTable
ALTER TABLE "course_versions" ADD COLUMN     "file_id" TEXT;

-- AddForeignKey
ALTER TABLE "course_versions" ADD CONSTRAINT "course_versions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
