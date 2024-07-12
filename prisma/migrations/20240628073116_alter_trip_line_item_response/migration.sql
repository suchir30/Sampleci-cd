-- AlterTable
ALTER TABLE `TripLineItem` ADD COLUMN `rollupDepsCount` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TripLineItem` ADD CONSTRAINT `TripLineItem_loadLocationId_fkey` FOREIGN KEY (`loadLocationId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
