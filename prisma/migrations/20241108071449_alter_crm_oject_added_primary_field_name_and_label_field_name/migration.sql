/*
  Warnings:

  - You are about to drop the column `cRMFieldId` on the `CRMObject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CRMObject` DROP COLUMN `cRMFieldId`,
    ADD COLUMN `labelFieldName` VARCHAR(191) NULL,
    ADD COLUMN `primaryFieldName` VARCHAR(191) NULL;
