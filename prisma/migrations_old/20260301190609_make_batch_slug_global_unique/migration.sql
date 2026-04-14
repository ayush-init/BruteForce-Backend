/*
  Warnings:

  - You are about to drop the column `class_number` on the `Class` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[batch_id,slug]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[topic_id,batch_id,class_name]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Batch` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `City` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `class_name` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Batch_city_id_slug_key";

-- DropIndex
DROP INDEX "Class_topic_id_batch_id_class_number_key";

-- AlterTable
ALTER TABLE "Batch" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "City" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "class_number",
ADD COLUMN     "class_name" VARCHAR(50) NOT NULL,
ADD COLUMN     "slug" VARCHAR(150) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Batch_slug_key" ON "Batch"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Class_batch_id_slug_key" ON "Class"("batch_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Class_topic_id_batch_id_class_name_key" ON "Class"("topic_id", "batch_id", "class_name");
