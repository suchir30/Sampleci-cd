/*
  Warnings:

  - You are about to drop the column `ActualWeightKg` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to drop the column `chargedWeight` on the `awblineitem` table. All the data in the column will be lost.
  - The values [SKURate] on the enum `Contract_consignorContractType` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `consignorratetable` DROP FOREIGN KEY `ConsignorRateTable_consignorId_fkey`;

-- AlterTable
ALTER TABLE `airwaybill` ADD COLUMN `chargedWeightWithCeiling` FLOAT NULL,
    ADD COLUMN `rollupArticleWeightKg` FLOAT NULL,
    ADD COLUMN `rollupCwWeight` FLOAT NULL,
    ADD COLUMN `rollupSKU` FLOAT NULL;

-- AlterTable
ALTER TABLE `awblineitem` DROP COLUMN `ActualWeightKg`,
    DROP COLUMN `chargedWeight`,
    ADD COLUMN `SKUCode` VARCHAR(191) NULL,
    ADD COLUMN `SKUId` INTEGER NULL,
    ADD COLUMN `actualFactorWeight` FLOAT NULL,
    ADD COLUMN `articleWeightKg` FLOAT NULL,
    ADD COLUMN `boxType` VARCHAR(191) NULL,
    ADD COLUMN `ratePerBox` FLOAT NULL,
    ADD COLUMN `volumetricFactorWeight` FLOAT NULL,
    ADD COLUMN `weightKgs` FLOAT NULL;

-- AlterTable
ALTER TABLE `consignorratetable` ADD COLUMN `boxType` ENUM('Mattress', 'Pillow', 'Box') NULL,
    ADD COLUMN `ratePerBox` DOUBLE NULL,
    MODIFY `consignorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `contract` ADD COLUMN `actualWeightFactor` FLOAT NULL,
    ADD COLUMN `cwCeiling` INTEGER NULL,
    ADD COLUMN `volumetricWeightFactor` FLOAT NULL,
    MODIFY `consignorContractType` ENUM('Actual', 'Volumetric', 'ActualVsVolumnetric', 'BoxRate', 'SKU') NOT NULL;

-- CreateTable
CREATE TABLE `SKU` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consignorId` INTEGER NULL,
    `SKUCode` VARCHAR(255) NOT NULL,
    `product` VARCHAR(255) NULL,
    `packSize` VARCHAR(255) NULL,
    `lengthCms` FLOAT NULL,
    `widthCms` FLOAT NULL,
    `heightCms` FLOAT NULL,
    `CDM` FLOAT NULL,
    `chargedWeight` FLOAT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConsignorRateTable` ADD CONSTRAINT `ConsignorRateTable_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SKU` ADD CONSTRAINT `SKU_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE SET NULL ON UPDATE CASCADE;
