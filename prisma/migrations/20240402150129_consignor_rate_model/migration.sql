-- AlterTable
ALTER TABLE `consignee` MODIFY `consigneeCode` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `ConsignorRateTable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consignorId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `ratePerKg` INTEGER NOT NULL,
    `status` ENUM('APPROVED', 'PENDING_APPROVAL') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConsignorRateTable` ADD CONSTRAINT `ConsignorRateTable_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsignorRateTable` ADD CONSTRAINT `ConsignorRateTable_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
