-- DropForeignKey
ALTER TABLE `HLFLineItem` DROP FOREIGN KEY `HLFLineItem_hlfLineItemAWBId_fkey`;

-- AlterTable
ALTER TABLE `Consignee` ADD COLUMN `PINCodeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `DEPS` ADD COLUMN `modifiedOn` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `DEPSImages` ADD COLUMN `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `DriverMaster`
    CHANGE COLUMN `panNumber` `PANNumber` VARCHAR(255) NULL,
    ADD COLUMN `licenseExpiryDate` DATETIME(3) NULL,
    ADD COLUMN `placeOfIssueRTA` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `FileUpload` ADD COLUMN `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `modifiedOn` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `HLFLineItem`
    CHANGE COLUMN `AWBCWeightInKgs` `AWBWeightInKgs` FLOAT NULL,
    CHANGE COLUMN `hlfLineItemAWBId` `HLFLineItemAWBId` INTEGER NOT NULL,
    CHANGE COLUMN `hlfLineStatus` `HLFLineStatus` ENUM('ToBeInwarded', 'Inwarded', 'Outwarded') NOT NULL;

-- AlterTable
ALTER TABLE `TripDetails`
    CHANGE COLUMN `ftlLocalNumber` `FTLLocalNumber` VARCHAR(255) NULL,
    CHANGE COLUMN `originalPODReceived` `originalPODsReceived` BOOLEAN NULL,
    CHANGE COLUMN `tdsAmount` `TDSAmount` FLOAT NULL,
    CHANGE COLUMN `utrDetails` `UTRDetails` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `TripLineItem`
    CHANGE COLUMN `latestScanTime` `latestArticleScanTime` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `VehicleMaster` ADD COLUMN `ChassisNumber` VARCHAR(191) NULL,
    ADD COLUMN `engineNumber` VARCHAR(191) NULL,
    ADD COLUMN `insuranceValidDate` DATETIME(3) NULL,
    ADD COLUMN `ownerAddress` VARCHAR(191) NULL,
    ADD COLUMN `ownerName` VARCHAR(191) NULL,
    ADD COLUMN `ownerPANCardNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `VendorMaster`
    CHANGE COLUMN `gstNumber` `GSTNumber` VARCHAR(255) NULL,
    CHANGE COLUMN `ifscCode` `IFSCCode` VARCHAR(255) NULL,
    CHANGE COLUMN `panNumber` `PANNumber` VARCHAR(255) NULL,
    CHANGE COLUMN `tanNumber` `TANNumber` VARCHAR(255) NULL,
    CHANGE COLUMN `tdsPercentageSlab` `TDSPercentageSlab` VARCHAR(255) NULL;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_HLFLineItemAWBId_fkey` FOREIGN KEY (`HLFLineItemAWBId`) REFERENCES `AirWayBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
