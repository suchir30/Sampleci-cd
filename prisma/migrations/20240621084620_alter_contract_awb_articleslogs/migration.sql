/*
  Warnings:

  - You are about to alter the column `fovOfCoustomersInvoiceValue` on the `contract` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `liabilityClause` on the `contract` table. The data in that column could be lost. The data in that column will be cast from `Float` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `AirWayBill` MODIFY `articleGenFlag` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `AwbArticleTripLogs` ADD COLUMN `tripLineItemId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Contract` MODIFY `fovOfCoustomersInvoiceValue` DOUBLE NULL,
    MODIFY `liabilityClause` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `AwbArticleTripLogs` ADD CONSTRAINT `AwbArticleTripLogs_tripLineItemId_fkey` FOREIGN KEY (`tripLineItemId`) REFERENCES `TripLineItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
