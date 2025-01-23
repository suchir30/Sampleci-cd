/*
  Warnings:

  - You are about to drop the column `ContractType` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `PTlRateType` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `actualWeightFactor` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `chargedWeightModel` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `volumetricWeightFactor` on the `contract` table. All the data in the column will be lost.
  - Made the column `consignorCode` on table `consignor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Consignor` MODIFY `consignorCode` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Contract` DROP COLUMN `ContractType`,
    DROP COLUMN `PTlRateType`,
    DROP COLUMN `actualWeightFactor`,
    DROP COLUMN `chargedWeightModel`,
    DROP COLUMN `volumetricWeightFactor`;
