-- AlterTable
ALTER TABLE `AirWayBill` MODIFY `articleGenFlag` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `AwbArticleTripLogs` ADD COLUMN `tripLineItemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AwbArticleTripLogs` ADD CONSTRAINT `AwbArticleTripLogs_tripLineItemId_fkey` FOREIGN KEY (`tripLineItemId`) REFERENCES `TripLineItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
