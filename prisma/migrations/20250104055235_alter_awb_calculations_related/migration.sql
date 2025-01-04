/*
  Warnings:

  - You are about to drop the column `AWBLineItemChargedWeight` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to drop the column `AWBLineItemweight` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to drop the column `actualFactorWeight` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to drop the column `volumetricFactorWeight` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to drop the column `chargedWeight` on the `sku` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `AirWayBill` ADD COLUMN `rollupPresentChargedWeight` FLOAT NULL;

-- AlterTable
ALTER TABLE `AwbLineItem` DROP COLUMN `AWBLineItemChargedWeight`,
    DROP COLUMN `AWBLineItemweight`,
    DROP COLUMN `actualFactorWeight`,
    DROP COLUMN `volume`,
    DROP COLUMN `volumetricFactorWeight`,
    ADD COLUMN `articlePresetChargedWeight` FLOAT NULL,
    ADD COLUMN `articleVolume` FLOAT NULL,
    ADD COLUMN `articleVolumeFactor` FLOAT NULL,
    ADD COLUMN `articleWeightFactor` FLOAT NULL,
    ADD COLUMN `lineItemChargedWeight` FLOAT NULL,
    ADD COLUMN `lineItemPresetChargedWeight` FLOAT NULL,
    ADD COLUMN `minimumArticleVolume` FLOAT NULL,
    ADD COLUMN `minimumArticleWeight` FLOAT NULL;

-- AlterTable
ALTER TABLE `Contract` ADD COLUMN `lineItemChargedWeightCalculation` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `SKU` DROP COLUMN `chargedWeight`,
    ADD COLUMN `articlePresetChargedWeight` FLOAT NULL,
    ADD COLUMN `articleVolume` FLOAT NULL,
    ADD COLUMN `articleVolumeFactor` FLOAT NULL,
    ADD COLUMN `articleWeightFactor` FLOAT NULL,
    ADD COLUMN `minimumArticleVolume` FLOAT NULL,
    ADD COLUMN `minimumArticleWeight` FLOAT NULL;
