-- DropForeignKey
ALTER TABLE `InternalInvoice` DROP FOREIGN KEY `InternalInvoice_consigneeId_fkey`;

-- DropForeignKey
ALTER TABLE `InternalInvoice` DROP FOREIGN KEY `InternalInvoice_consignorId_fkey`;

-- DropForeignKey
ALTER TABLE `InternalInvoice` DROP FOREIGN KEY `InternalInvoice_contractId_fkey`;

-- AlterTable
ALTER TABLE `AirWayBill` ADD COLUMN `setDetentionCharges` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Consignee` ADD COLUMN `modernTradeConsignee` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `Contract` ADD COLUMN `FOVFixedValue` FLOAT NULL,
    ADD COLUMN `FOVPercentage` FLOAT NULL,
    ADD COLUMN `articleCharge` FLOAT NULL,
    ADD COLUMN `detentionCharge` FLOAT NULL,
    ADD COLUMN `docketCharge` FLOAT NULL,
    ADD COLUMN `doorBookingCharge` FLOAT NULL,
    ADD COLUMN `doorBookingWeight` FLOAT NULL,
    ADD COLUMN `fuelSurchargePercentage` FLOAT NULL,
    ADD COLUMN `loadUnloadCharge` FLOAT NULL,
    ADD COLUMN `modernTradeFixedValue` FLOAT NULL,
    ADD COLUMN `modernTradeRatePerKg` FLOAT NULL;

-- AlterTable
ALTER TABLE `InternalInvoice` ADD COLUMN `FOV` FLOAT NULL,
    ADD COLUMN `articleCharge` FLOAT NULL,
    ADD COLUMN `detentionCharge` FLOAT NULL,
    ADD COLUMN `docketCharge` FLOAT NULL,
    ADD COLUMN `doorBookingCharge` FLOAT NULL,
    ADD COLUMN `fuelSurcharge` FLOAT NULL,
    ADD COLUMN `loadUnloadCharge` FLOAT NULL,
    ADD COLUMN `modernTradeCharge` FLOAT NULL,
    MODIFY `consignorId` INTEGER NULL,
    MODIFY `consigneeId` INTEGER NULL,
    MODIFY `contractId` INTEGER NULL,
    MODIFY `ODACharge` FLOAT NULL,
    MODIFY `baseCharge` FLOAT NULL;

-- AddForeignKey
ALTER TABLE `InternalInvoice` ADD CONSTRAINT `InternalInvoice_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternalInvoice` ADD CONSTRAINT `InternalInvoice_consigneeId_fkey` FOREIGN KEY (`consigneeId`) REFERENCES `Consignee`(`consigneeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternalInvoice` ADD CONSTRAINT `InternalInvoice_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
