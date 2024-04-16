-- AlterTable
ALTER TABLE `Consignee` MODIFY `consigneeCode` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Consignor` ADD COLUMN `gstId` INTEGER NULL;

-- CreateTable
CREATE TABLE `ConsignorRateTable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consignorId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `ratePerKg` INTEGER NULL,
    `status` ENUM('APPROVED', 'PENDING_APPROVAL') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GstMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GstMaster_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_gstId_fkey` FOREIGN KEY (`gstId`) REFERENCES `GstMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsignorRateTable` ADD CONSTRAINT `ConsignorRateTable_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsignorRateTable` ADD CONSTRAINT `ConsignorRateTable_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
