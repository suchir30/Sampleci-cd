/*
  Warnings:

  - You are about to drop the column `nextDestinationId` on the `triplineitem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `TripLineItem` DROP FOREIGN KEY `TripLineItem_nextDestinationId_fkey`;

-- AlterTable
ALTER TABLE `AirWayBill` MODIFY `AWBStatus` ENUM('PickUp', 'InTransit', 'atHub', 'outForDelivery', 'Delivered') NOT NULL DEFAULT 'PickUp';

-- AlterTable
ALTER TABLE `Branch` ADD COLUMN `isWareHouse` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `Consignor` ADD COLUMN `wareHouseId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TripLineItem` DROP COLUMN `nextDestinationId`,
    ADD COLUMN `latestScanTime` DATETIME(3) NULL,
    ADD COLUMN `loadLocationId` INTEGER NULL,
    ADD COLUMN `rollupScanCount` INTEGER NULL,
    ADD COLUMN `unloadLocationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_wareHouseId_fkey` FOREIGN KEY (`wareHouseId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripLineItem` ADD CONSTRAINT `TripLineItem_unloadLocationId_fkey` FOREIGN KEY (`unloadLocationId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
