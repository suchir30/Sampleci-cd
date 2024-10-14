/*
  Warnings:

  - You are about to drop the column `charges` on the `oda` table. All the data in the column will be lost.
  - You are about to drop the column `odaKmLowerLimit` on the `oda` table. All the data in the column will be lost.
  - You are about to drop the column `odaKmUpperLimit` on the `oda` table. All the data in the column will be lost.
  - You are about to drop the column `odaType` on the `oda` table. All the data in the column will be lost.
  - You are about to drop the column `weightLowerLimit` on the `oda` table. All the data in the column will be lost.
  - You are about to drop the column `weightUpperLimit` on the `oda` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ConsignorRateTable` ADD COLUMN `chargedWeightHigher` FLOAT NULL,
    ADD COLUMN `chargedWeightLower` FLOAT NULL;

-- AlterTable
ALTER TABLE `Contract` ADD COLUMN `baseChargeType` ENUM('withChargedWeightRange', 'withoutChargedWeightRange') NULL,
    ADD COLUMN `odaChargeType` ENUM('withChargedWeightRange', 'withoutChargedWeightRange') NULL;

-- AlterTable
ALTER TABLE `ODA` DROP COLUMN `charges`,
    DROP COLUMN `odaKmLowerLimit`,
    DROP COLUMN `odaKmUpperLimit`,
    DROP COLUMN `odaType`,
    DROP COLUMN `weightLowerLimit`,
    DROP COLUMN `weightUpperLimit`,
    ADD COLUMN `ODABoxType` VARCHAR(255) NULL,
    ADD COLUMN `ODARatePerBox` FLOAT NULL,
    ADD COLUMN `ODARatePerKg` FLOAT NULL,
    ADD COLUMN `chargedWeightHigher` FLOAT NULL,
    ADD COLUMN `chargedWeightLower` FLOAT NULL,
    ADD COLUMN `kmEndingRange` INTEGER NULL,
    ADD COLUMN `kmStartingRange` INTEGER NULL,
    ADD COLUMN `minimumCharge` FLOAT NULL;

-- CreateTable
CREATE TABLE `InternalInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `AWBId` INTEGER NOT NULL,
    `consignorId` INTEGER NOT NULL,
    `consigneeId` INTEGER NOT NULL,
    `contractId` INTEGER NOT NULL,
    `ODACharge` FLOAT NOT NULL,
    `baseCharge` FLOAT NOT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InternalInvoiceLineItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `internalInvoiceId` INTEGER NOT NULL,
    `AWBLineItemId` INTEGER NOT NULL,
    `ODACharge` FLOAT NOT NULL,
    `baseCharge` FLOAT NOT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InternalInvoice` ADD CONSTRAINT `InternalInvoice_AWBId_fkey` FOREIGN KEY (`AWBId`) REFERENCES `AirWayBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternalInvoice` ADD CONSTRAINT `InternalInvoice_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternalInvoice` ADD CONSTRAINT `InternalInvoice_consigneeId_fkey` FOREIGN KEY (`consigneeId`) REFERENCES `Consignee`(`consigneeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternalInvoice` ADD CONSTRAINT `InternalInvoice_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternalInvoiceLineItems` ADD CONSTRAINT `InternalInvoiceLineItems_internalInvoiceId_fkey` FOREIGN KEY (`internalInvoiceId`) REFERENCES `InternalInvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternalInvoiceLineItems` ADD CONSTRAINT `InternalInvoiceLineItems_AWBLineItemId_fkey` FOREIGN KEY (`AWBLineItemId`) REFERENCES `AwbLineItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
