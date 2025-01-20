/*
  Warnings:

  - You are about to drop the column `rollupPresentChargedWeight` on the `airwaybill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `TripDetails` DROP FOREIGN KEY `TripDetails_driverId_fkey`;

-- DropForeignKey
ALTER TABLE `TripDetails` DROP FOREIGN KEY `TripDetails_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `TripDetails` DROP FOREIGN KEY `TripDetails_vendorId_fkey`;


ALTER TABLE `AirWayBill`
CHANGE COLUMN `rollupPresentChargedWeight` `rollupPresetChargedWeight` FLOAT NULL;


-- AlterTable
ALTER TABLE `DriverMaster` ADD COLUMN `marketpeAutoIdentifier` VARCHAR(191) NULL,
    ADD COLUMN `marketpeAutoIdentifierNumber` INTEGER NULL,
    ADD COLUMN `marketpeCreatedTime` DATETIME(3) NULL,
    ADD COLUMN `marketpeId` VARCHAR(191) NULL,
    ADD COLUMN `marketpeIdentifier` VARCHAR(191) NULL,
    ADD COLUMN `marketpeName` VARCHAR(191) NULL,
    ADD COLUMN `marketpePhone` VARCHAR(191) NULL,
    ADD COLUMN `marketpeType` VARCHAR(191) NULL,
    MODIFY `driverName` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `TripDetails` ADD COLUMN `marketpeAutoIdentifier` VARCHAR(191) NULL,
    ADD COLUMN `marketpeAutoIdentifierNumber` INTEGER NULL,
    ADD COLUMN `marketpeBookingFreight` INTEGER NULL,
    ADD COLUMN `marketpeConsigneeGst` VARCHAR(191) NULL,
    ADD COLUMN `marketpeConsigneeName` VARCHAR(191) NULL,
    ADD COLUMN `marketpeConsignorGst` VARCHAR(191) NULL,
    ADD COLUMN `marketpeConsignorName` VARCHAR(191) NULL,
    ADD COLUMN `marketpeCreatedTime` DATETIME(3) NULL,
    ADD COLUMN `marketpeDistance` INTEGER NULL,
    ADD COLUMN `marketpeFromPlace` VARCHAR(191) NULL,
    ADD COLUMN `marketpeId` VARCHAR(191) NULL,
    ADD COLUMN `marketpeIdentifier` VARCHAR(191) NULL,
    ADD COLUMN `marketpeOdometerEndKm` INTEGER NULL,
    ADD COLUMN `marketpeOdometerStartKm` INTEGER NULL,
    ADD COLUMN `marketpeRemarks` VARCHAR(191) NULL,
    ADD COLUMN `marketpeStatus` VARCHAR(191) NULL,
    ADD COLUMN `marketpeStops` VARCHAR(191) NULL,
    ADD COLUMN `marketpeToPlace` VARCHAR(191) NULL,
    MODIFY `vendorId` INTEGER NULL,
    MODIFY `vehicleId` INTEGER NULL,
    MODIFY `driverId` INTEGER NULL;

-- AlterTable
ALTER TABLE `VehicleMaster` ADD COLUMN `marketpeAutoIdentifier` VARCHAR(191) NULL,
    ADD COLUMN `marketpeAutoIdentifierNumber` INTEGER NULL,
    ADD COLUMN `marketpeCreatedTime` DATETIME(3) NULL,
    ADD COLUMN `marketpeId` VARCHAR(191) NULL,
    ADD COLUMN `marketpeRegistrationNumber` VARCHAR(191) NULL,
    MODIFY `vehicleNum` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `VendorMaster` ADD COLUMN `marketpeAutoIdentifier` VARCHAR(191) NULL,
    ADD COLUMN `marketpeAutoIdentifierNumber` INTEGER NULL,
    ADD COLUMN `marketpeCreatedTime` DATETIME(3) NULL,
    ADD COLUMN `marketpeId` VARCHAR(191) NULL,
    ADD COLUMN `marketpeIdentifier` VARCHAR(191) NULL,
    ADD COLUMN `marketpeName` VARCHAR(191) NULL,
    ADD COLUMN `marketpePhone` VARCHAR(191) NULL,
    ADD COLUMN `marketpeType` VARCHAR(191) NULL,
    MODIFY `vendorCode` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `ExternalRequestLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendorName` VARCHAR(191) NOT NULL,
    `requestType` VARCHAR(191) NOT NULL,
    `requestBody` LONGTEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `errorMessage` VARCHAR(2048) NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleOwner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marketpeId` VARCHAR(191) NULL,
    `marketpeCreatedTime` DATETIME(3) NULL,
    `marketpeAutoIdentifier` VARCHAR(191) NULL,
    `marketpeAutoIdentifierNumber` INTEGER NULL,
    `marketpeIdentifier` VARCHAR(191) NULL,
    `marketpeName` VARCHAR(191) NULL,
    `marketpePhone` VARCHAR(191) NULL,
    `marketpeType` VARCHAR(191) NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `VendorMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `VehicleMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `DriverMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
