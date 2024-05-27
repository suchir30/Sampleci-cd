-- AlterTable
ALTER TABLE `AirWayBill` ADD COLUMN `ewayBillNumber` VARCHAR(255) NULL,
    MODIFY `invoiceNumber` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `AwbLineItem` ADD COLUMN `volume` FLOAT NULL;
