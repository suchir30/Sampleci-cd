/*
  Warnings:

  - You are about to drop the column `labelFieldName` on the `CRMField` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CRMField` DROP COLUMN `labelFieldName`,
    ADD COLUMN `isRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `relatedObjectId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CRMField` ADD CONSTRAINT `CRMField_relatedObjectId_fkey` FOREIGN KEY (`relatedObjectId`) REFERENCES `CRMObject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
