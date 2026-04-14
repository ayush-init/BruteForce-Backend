/*
  Warnings:

  - You are about to drop the column `is_profile_complete` on the `Student` table. All the data in the column will be lost.
  - You are about to alter the column `slug` on the `Topic` table. The data in that column could be lost. The data in that column will be cast from `VarChar(170)` to `VarChar(80)`.
  - You are about to drop the `Bookmark` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_question_id_fkey";

-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_student_id_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "is_profile_complete";

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "description" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(80);

-- DropTable
DROP TABLE "Bookmark";
