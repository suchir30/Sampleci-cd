-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_TicketRaisedBranchId_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_loadingHubId_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_loadingUserId_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_tripIdRoute_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_unloadingUserId_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_vehicleNumberId_fkey`;

-- DropForeignKey
ALTER TABLE `HLFLineItem` DROP FOREIGN KEY `HLFLineItem_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `TripCheckIn` DROP FOREIGN KEY `TripCheckIn_locationBranchId_fkey`;

-- DropForeignKey
ALTER TABLE `TripLineItem` DROP FOREIGN KEY `TripLineItem_finalDestinationId_fkey`;

-- DropForeignKey
ALTER TABLE `TripLineItem` DROP FOREIGN KEY `TripLineItem_nextDestinationId_fkey`;

-- AlterTable
ALTER TABLE `DEPS` MODIFY `loadingHubId` INTEGER NULL,
    MODIFY `numberOfDepsArticles` INTEGER NULL,
    MODIFY `vehicleNumberId` INTEGER NULL,
    MODIFY `tripIdRoute` INTEGER NULL,
    MODIFY `connectedDate` DATETIME(3) NULL,
    MODIFY `TicketRaisedBranchId` INTEGER NULL,
    MODIFY `loadingUserId` INTEGER NULL,
    MODIFY `unloadingUserId` INTEGER NULL,
    MODIFY `depsStatus` ENUM('Open', 'Cleared') NULL;

-- AlterTable
ALTER TABLE `HLFLineItem` MODIFY `branchId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TripCheckIn` MODIFY `locationBranchId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TripLineItem` MODIFY `nextDestinationId` INTEGER NULL,
    MODIFY `finalDestinationId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Contract` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consignorId` INTEGER NOT NULL,
    `consignorContractType` ENUM('Actual', 'Volumetric', 'ActualVsVolumnetric', 'BoxRate', 'SKURate') NOT NULL,
    `ContractType` ENUM('FTL', 'PTL') NULL,
    `isActive` BOOLEAN NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `PTlRateType` ENUM('RatePerKG', 'RatePerBox') NULL,
    `monthlyMinCommitVolume` INTEGER NULL,
    `minimumAWBValue` FLOAT NULL,
    `docketChargeValue` FLOAT NULL,
    `fovOfCoustomersInvoiceValue` INTEGER NULL,
    `liabilityClause` FLOAT NULL,
    `articleChargeMandatory` FLOAT NULL,
    `articleChargeMinAmount` FLOAT NULL,
    `articleChargeMaxAmount` FLOAT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TripCheckIn` ADD CONSTRAINT `TripCheckIn_locationBranchId_fkey` FOREIGN KEY (`locationBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripLineItem` ADD CONSTRAINT `TripLineItem_nextDestinationId_fkey` FOREIGN KEY (`nextDestinationId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripLineItem` ADD CONSTRAINT `TripLineItem_finalDestinationId_fkey` FOREIGN KEY (`finalDestinationId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_loadingHubId_fkey` FOREIGN KEY (`loadingHubId`) REFERENCES `HLFLineItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_vehicleNumberId_fkey` FOREIGN KEY (`vehicleNumberId`) REFERENCES `VehicleMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_tripIdRoute_fkey` FOREIGN KEY (`tripIdRoute`) REFERENCES `TripDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_TicketRaisedBranchId_fkey` FOREIGN KEY (`TicketRaisedBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_loadingUserId_fkey` FOREIGN KEY (`loadingUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_unloadingUserId_fkey` FOREIGN KEY (`unloadingUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE RESTRICT ON UPDATE CASCADE;
