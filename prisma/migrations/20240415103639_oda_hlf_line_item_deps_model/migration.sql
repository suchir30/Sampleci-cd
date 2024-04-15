/*
  Warnings:

  - You are about to alter the column `status` on the `awbarticle` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.
  - You are about to alter the column `status` on the `consignorratetable` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `awbarticle` MODIFY `status` ENUM('Created', 'Printed', 'Deleted') NOT NULL DEFAULT 'Created';

-- AlterTable
ALTER TABLE `consignorratetable` MODIFY `status` ENUM('Approved', 'PendingApproval') NOT NULL DEFAULT 'PendingApproval';

-- CreateTable
CREATE TABLE `ODA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consignorId` INTEGER NOT NULL,
    `odaType` VARCHAR(255) NOT NULL,
    `odaKmLowerLimit` FLOAT NULL,
    `odaKmUpperLimit` FLOAT NULL,
    `weightLowerLimit` FLOAT NULL,
    `weightUpperLimit` FLOAT NULL,
    `charges` FLOAT NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HLFLineItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hlfLineItemAWBId` INTEGER NOT NULL,
    `hlfLineStatus` ENUM('ToBeInwarded', 'Inwarded', 'Outwarded') NOT NULL,
    `branchId` INTEGER NOT NULL,
    `AWBCWeightInKgs` FLOAT NULL,
    `AWBVolumeInKgs` FLOAT NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DEPS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `DEPSType` ENUM('Damage', 'Excess', 'Pilferage', 'Shorts') NOT NULL,
    `DEPSSubType` VARCHAR(255) NOT NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `AWBId` INTEGER NOT NULL,
    `loadingHubId` INTEGER NOT NULL,
    `numberOfDepsArticles` INTEGER NOT NULL,
    `vehicleNumberId` INTEGER NOT NULL,
    `tripIdRoute` INTEGER NOT NULL,
    `connectedDate` DATETIME(3) NOT NULL,
    `TicketRaisedBranchId` INTEGER NOT NULL,
    `loadingUserId` INTEGER NOT NULL,
    `unloadingUserId` INTEGER NOT NULL,
    `sealNumber` VARCHAR(255) NULL,
    `depsStatus` ENUM('Open', 'Cleared') NOT NULL,
    `caseComment` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImageLinks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeId` ENUM('DEPS', 'AWB', 'GST', 'ShippingLabel') NOT NULL,
    `path` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ODA` ADD CONSTRAINT `ODA_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_hlfLineItemAWBId_fkey` FOREIGN KEY (`hlfLineItemAWBId`) REFERENCES `AirWayBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_AWBId_fkey` FOREIGN KEY (`AWBId`) REFERENCES `AirWayBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_loadingHubId_fkey` FOREIGN KEY (`loadingHubId`) REFERENCES `HLFLineItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_vehicleNumberId_fkey` FOREIGN KEY (`vehicleNumberId`) REFERENCES `VehicleMaster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_tripIdRoute_fkey` FOREIGN KEY (`tripIdRoute`) REFERENCES `TripDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_TicketRaisedBranchId_fkey` FOREIGN KEY (`TicketRaisedBranchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_loadingUserId_fkey` FOREIGN KEY (`loadingUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_unloadingUserId_fkey` FOREIGN KEY (`unloadingUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
