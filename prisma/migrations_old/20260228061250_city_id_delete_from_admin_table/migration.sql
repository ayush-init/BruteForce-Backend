/*
  Warnings:

  - You are about to drop the column `city_id` on the `Admin` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_city_id_fkey";

-- DropIndex
DROP INDEX "Admin_city_id_idx";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "city_id";
