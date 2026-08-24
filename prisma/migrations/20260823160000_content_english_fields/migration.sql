
-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "content_en" TEXT,
ADD COLUMN     "excerpt_en" TEXT,
ADD COLUMN     "title_en" TEXT;

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "title_en" TEXT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "title_en" TEXT;

-- AlterTable
ALTER TABLE "cursus" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "title_en" TEXT;

-- AlterTable
ALTER TABLE "formation_parts" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "title_en" TEXT;

-- AlterTable
ALTER TABLE "formations" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "title_en" TEXT;

-- AlterTable
ALTER TABLE "levels" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "name_en" TEXT;

-- AlterTable
ALTER TABLE "quiz_options" ADD COLUMN     "label_en" TEXT;

-- AlterTable
ALTER TABLE "quiz_questions" ADD COLUMN     "question_en" TEXT;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "title_en" TEXT;

