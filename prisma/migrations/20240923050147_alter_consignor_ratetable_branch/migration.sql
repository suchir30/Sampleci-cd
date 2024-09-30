/*
  Warnings:
  - You are about to alter the column `boxType` on the `consignorratetable` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(10))` to `VarChar(191)`.
  - Made the column `vendorId` on table `tripdetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vehicleId` on table `tripdetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `driverId` on table `tripdetails` required. This step will fail if there are existing NULL values in that column.
*/
-- DropForeignKey
ALTER TABLE `TripDetails` DROP FOREIGN KEY `TripDetails_driverId_fkey`;
-- DropForeignKey
ALTER TABLE `TripDetails` DROP FOREIGN KEY `TripDetails_vehicleId_fkey`;
-- DropForeignKey
ALTER TABLE `TripDetails` DROP FOREIGN KEY `TripDetails_vendorId_fkey`;
-- AlterTable
ALTER TABLE `Branch` MODIFY `isActive` BOOLEAN NULL DEFAULT false;
-- AlterTable
ALTER TABLE `ConsignorRateTable` MODIFY `boxType` VARCHAR(191) NULL;
-- AlterTable
ALTER TABLE `TripDetails` MODIFY `vendorId` INTEGER NOT NULL,
    MODIFY `vehicleId` INTEGER NOT NULL,
    MODIFY `driverId` INTEGER NOT NULL;
-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `VendorMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `VehicleMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `DriverMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
