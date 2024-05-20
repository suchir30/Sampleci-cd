-- AlterTable
ALTER TABLE `airwaybill` ADD COLUMN `ewayBillNumber` VARCHAR(255) NULL,
    MODIFY `invoiceNumber` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `awblineitem` ADD COLUMN `volume` FLOAT NULL;
