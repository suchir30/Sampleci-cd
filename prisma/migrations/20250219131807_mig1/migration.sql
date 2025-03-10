-- AlterTable
ALTER TABLE `Contract` ADD COLUMN `ContractType` VARCHAR(191) NULL,
    ADD COLUMN `PTlRateType` VARCHAR(191) NULL,
    ADD COLUMN `actualWeightFactor` DOUBLE NULL,
    ADD COLUMN `volumetricWeightFactor` DOUBLE NULL;
