/*
  Warnings:

  - Made the column `publicName` on table `Consignor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `legalName` on table `Consignor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Consignee_consigneeCode_key` ON `Consignee`;

-- DropIndex
DROP INDEX `Consignor_consignorCode_key` ON `Consignor`;

-- AlterTable
ALTER TABLE `Consignor` MODIFY `consignorCode` VARCHAR(255) NULL,
    MODIFY `publicName` VARCHAR(255) NOT NULL,
    MODIFY `legalName` VARCHAR(255) NOT NULL;
