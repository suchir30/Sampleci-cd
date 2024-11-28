/*
  Warnings:

  - You are about to alter the column `viewIndex` on the `CRMObjectGroup` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `viewIndex` on the `CRMObjectRelations` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - Added the required column `relatedFieldName` to the `CRMObjectRelations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CRMObjectGroup` MODIFY `viewIndex` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `CRMObjectRelations` ADD COLUMN `relatedFieldName` VARCHAR(191) NOT NULL,
    MODIFY `viewIndex` DOUBLE NULL;
