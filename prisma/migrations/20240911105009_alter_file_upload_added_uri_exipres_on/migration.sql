/*
  Warnings:

  - You are about to drop the column `sourceId` on the `FileUpload` table. All the data in the column will be lost.
  - Added the required column `uri` to the `FileUpload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FileUpload` DROP COLUMN `sourceId`,
    ADD COLUMN `expiresOn` DATETIME(3) NULL,
    ADD COLUMN `sourceType` ENUM('Local', 'S3Bucket') NULL,
    ADD COLUMN `uri` VARCHAR(500) NOT NULL;
