-- DropForeignKey
ALTER TABLE `hlflineitem` DROP FOREIGN KEY `HLFLineItem_hlfLineItemAWBId_fkey`;

-- AlterTable
ALTER TABLE `consignee` ADD COLUMN `PINCodeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `deps` ADD COLUMN `modifiedOn` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `depsimages` ADD COLUMN `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `drivermaster`
    CHANGE COLUMN `panNumber` `PANNumber` VARCHAR(255) NULL,
    ADD COLUMN `licenseExpiryDate` DATETIME(3) NULL,
    ADD COLUMN `placeOfIssueRTA` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `fileupload` ADD COLUMN `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `modifiedOn` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `hlflineitem`
    CHANGE COLUMN `AWBCWeightInKgs` `AWBWeightInKgs` FLOAT NULL,
    CHANGE COLUMN `hlfLineItemAWBId` `HLFLineItemAWBId` INTEGER NOT NULL,
    CHANGE COLUMN `hlfLineStatus` `HLFLineStatus` ENUM('ToBeInwarded', 'Inwarded', 'Outwarded') NOT NULL;

-- AlterTable
ALTER TABLE `tripdetails` DROP COLUMN `ftlLocalNumber`,
    CHANGE COLUMN `originalPODReceived` `originalPODsReceived` BOOLEAN NULL,
    CHANGE COLUMN `tdsAmount` `TDSAmount` FLOAT NULL,
    CHANGE COLUMN `utrDetails` `UTRDetails` VARCHAR(255) NULL,
    ADD COLUMN `FTLLocalNumber` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `triplineitem`
    CHANGE COLUMN `latestScanTime` `latestArticleScanTime` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `vehiclemaster` ADD COLUMN `chassisNumber` VARCHAR(191) NULL,
    ADD COLUMN `engineNumber` VARCHAR(191) NULL,
    ADD COLUMN `insuranceValidDate` DATETIME(3) NULL,
    ADD COLUMN `ownerAddress` VARCHAR(191) NULL,
    ADD COLUMN `ownerName` VARCHAR(191) NULL,
    ADD COLUMN `ownerPANCardNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `vendormaster`
    CHANGE COLUMN `gstNumber` `GSTNumber` VARCHAR(255) NULL,
    CHANGE COLUMN `ifscCode` `IFSCCode` VARCHAR(255) NULL,
    CHANGE COLUMN `panNumber` `PANNumber` VARCHAR(255) NULL,
    CHANGE COLUMN `tanNumber` `TANNumber` VARCHAR(255) NULL,
    CHANGE COLUMN `tdsPercentageSlab` `TDSPercentageSlab` VARCHAR(255) NULL;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_HLFLineItemAWBId_fkey` FOREIGN KEY (`HLFLineItemAWBId`) REFERENCES `AirWayBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
