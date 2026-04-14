-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "batch_id" INTEGER,
ADD COLUMN     "city_id" INTEGER;

-- CreateIndex
CREATE INDEX "Admin_city_id_idx" ON "Admin"("city_id");

-- CreateIndex
CREATE INDEX "Admin_batch_id_idx" ON "Admin"("batch_id");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
