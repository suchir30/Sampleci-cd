/*
  Warnings:

  - A unique constraint covering the columns `[SortFieldId]` on the table `CRMObject` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CRMObject` ADD COLUMN `SortFieldId` INTEGER NULL,
    ADD COLUMN `SortOrder` ENUM('asc', 'desc') NOT NULL DEFAULT 'desc',
    ADD COLUMN `cRMFieldId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CRMObject_SortFieldId_key` ON `CRMObject`(`SortFieldId`);

-- AddForeignKey
ALTER TABLE `CRMObject` ADD CONSTRAINT `CRMObject_SortFieldId_fkey` FOREIGN KEY (`SortFieldId`) REFERENCES `CRMField`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
