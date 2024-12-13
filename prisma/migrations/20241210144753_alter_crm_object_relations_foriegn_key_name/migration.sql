/*
  Warnings:

  - You are about to drop the column `relatedFieldName` on the `CRMObjectRelations` table. All the data in the column will be lost.
  - Added the required column `foriegnKeyName` to the `CRMObjectRelations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CRMObjectRelations` DROP COLUMN `relatedFieldName`,
    ADD COLUMN `foriegnKeyName` VARCHAR(191) NOT NULL;
