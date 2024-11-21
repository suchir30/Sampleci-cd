/*
  Warnings:

  - You are about to alter the column `viewIndex` on the `CRMField` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - The values [comboBox] on the enum `CRMField_fieldType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `primaryFieldName` on the `CRMObject` table. All the data in the column will be lost.
  - You are about to alter the column `viewIndex` on the `CRMObject` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `CRMField` ADD COLUMN `enumListName` VARCHAR(191) NULL,
    MODIFY `viewIndex` DOUBLE NULL,
    MODIFY `fieldType` ENUM('calculated', 'checkbox', 'currency', 'datePicker', 'email', 'encryptedString', 'id', 'multiPicklist', 'numberInput', 'percent', 'phone', 'picklist', 'relation', 'textInput', 'textArea', 'url') NULL;

-- AlterTable
ALTER TABLE `CRMObject` DROP COLUMN `primaryFieldName`,
    ADD COLUMN `primaryKeyName` VARCHAR(191) NULL,
    MODIFY `viewIndex` DOUBLE NULL;
