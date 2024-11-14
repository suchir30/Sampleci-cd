/*
  Warnings:

  - You are about to drop the column `CDM` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `chargedWeightWithCeiling` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `grandTotal` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `rollupArticleWeightKg` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `rollupChargedWtInKgs` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `rollupCwWeight` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `rollupSKU` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `subTotal` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `weightKgs` on the `airwaybill` table. All the data in the column will be lost.
  - You are about to drop the column `articleWeightKg` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to drop the column `weightKgs` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to drop the column `baseChargeType` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `consignorContractType` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `cwCeiling` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `odaChargeType` on the `contract` table. All the data in the column will be lost.
  - Added the required column `chargedWeightModel` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consignorPricingModel` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `airwaybill` DROP COLUMN `CDM`,
    DROP COLUMN `chargedWeightWithCeiling`,
    DROP COLUMN `grandTotal`,
    DROP COLUMN `rollupArticleWeightKg`,
    DROP COLUMN `rollupChargedWtInKgs`,
    DROP COLUMN `rollupCwWeight`,
    DROP COLUMN `rollupSKU`,
    DROP COLUMN `subTotal`,
    DROP COLUMN `weightKgs`,
    ADD COLUMN `AWBCDM` FLOAT NULL,
    ADD COLUMN `AWBChargedWeight` FLOAT NULL,
    ADD COLUMN `AWBChargedWeightWithCeiling` FLOAT NULL,
    ADD COLUMN `AWBWeight` FLOAT NULL,
    ADD COLUMN `rollupChargedWeight` FLOAT NULL;

-- AlterTable
ALTER TABLE `awblineitem` DROP COLUMN `articleWeightKg`,
    DROP COLUMN `weightKgs`,
    ADD COLUMN `AWBLineItemChargedWeight` FLOAT NULL,
    ADD COLUMN `AWBLineItemweight` FLOAT NULL,
    ADD COLUMN `articleWeight` FLOAT NULL;

-- AlterTable
ALTER TABLE `contract` DROP COLUMN `baseChargeType`,
    DROP COLUMN `consignorContractType`,
    DROP COLUMN `cwCeiling`,
    DROP COLUMN `odaChargeType`,
    ADD COLUMN `AWBCDMAccess` ENUM('Read', 'Write', 'None') NOT NULL DEFAULT 'None',
    ADD COLUMN `AWBChargedWeightAccess` ENUM('Read', 'Write', 'None') NOT NULL DEFAULT 'None',
    ADD COLUMN `AWBLineItemArticleWeightAccess` ENUM('Read', 'Write', 'None') NOT NULL DEFAULT 'None',
    ADD COLUMN `AWBLineItemLBHAccess` ENUM('Read', 'Write', 'None') NOT NULL DEFAULT 'None',
    ADD COLUMN `AWBWeightAccess` ENUM('Read', 'Write', 'None') NOT NULL DEFAULT 'None',
    ADD COLUMN `ODAChargedWeightRange` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `baseChargeChargedWeightRange` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `chargedWeightCeilingFactor` INTEGER NULL,
    ADD COLUMN `chargedWeightFactor` FLOAT NULL,
    ADD COLUMN `chargedWeightModel` ENUM('Actual', 'Volumetric', 'ActualVsVolumnetric', 'SKU') NOT NULL,
    ADD COLUMN `consignorPricingModel` ENUM('ChargedWeight', 'BoxRate') NOT NULL;
