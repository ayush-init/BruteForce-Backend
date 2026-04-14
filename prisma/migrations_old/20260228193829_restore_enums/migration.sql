/*
  Warnings:

  - You are about to drop the column `batch_id` on the `QuestionVisibility` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[city_id,slug]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[topic_id,batch_id,class_number]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuestionVisibility" DROP CONSTRAINT "QuestionVisibility_batch_id_fkey";

-- DropIndex
DROP INDEX "QuestionVisibility_batch_id_idx";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "slug" VARCHAR(80);

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "slug" VARCHAR(120);

-- AlterTable
ALTER TABLE "QuestionVisibility" DROP COLUMN "batch_id";

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "slug" VARCHAR(170) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Batch_city_id_slug_key" ON "Batch"("city_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Class_topic_id_batch_id_class_number_key" ON "Class"("topic_id", "batch_id", "class_number");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");
