/*
  Warnings:

  - You are about to drop the column `branchId` on the `hlflineitem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `hlflineitem` DROP FOREIGN KEY `HLFLineItem_branchId_fkey`;

-- AlterTable
ALTER TABLE `hlflineitem` DROP COLUMN `branchId`,
    ADD COLUMN `HLFLineItemCDM` FLOAT NULL,
    ADD COLUMN `HLFLineItemWeight` FLOAT NULL,
    ADD COLUMN `consigneeId` INTEGER NULL,
    ADD COLUMN `consignorId` INTEGER NULL,
    ADD COLUMN `finalBranchId` INTEGER NULL,
    ADD COLUMN `finalHubId` INTEGER NULL,
    ADD COLUMN `hubId` INTEGER NULL,
    ADD COLUMN `numberOfArticles` INTEGER NULL;

-- CreateTable
CREATE TABLE `BranchHubMap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NULL,
    `hubId` INTEGER NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_hubId_fkey` FOREIGN KEY (`hubId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_finalHubId_fkey` FOREIGN KEY (`finalHubId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_finalBranchId_fkey` FOREIGN KEY (`finalBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HLFLineItem` ADD CONSTRAINT `HLFLineItem_consigneeId_fkey` FOREIGN KEY (`consigneeId`) REFERENCES `Consignee`(`consigneeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchHubMap` ADD CONSTRAINT `BranchHubMap_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchHubMap` ADD CONSTRAINT `BranchHubMap_hubId_fkey` FOREIGN KEY (`hubId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
