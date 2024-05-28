/*
  Warnings:

  - You are about to drop the `imagelinks` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `AirWayBill` ADD COLUMN `AWBPdf` INTEGER NULL;

-- AlterTable
ALTER TABLE `Consignor` ADD COLUMN `gstExemptFileId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TripCheckIn` ADD COLUMN `odometerImgId` INTEGER NULL;

-- DropTable
DROP TABLE `ImageLinks`;

-- CreateTable
CREATE TABLE `DEPSImages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `depsId` INTEGER NOT NULL,
    `fileId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileUpload` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('DEPS', 'AWB', 'GST', 'ShippingLabel', 'TripCheckin') NULL,
    `path` VARCHAR(255) NOT NULL,
    `sourceId` VARCHAR(255) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_gstExemptFileId_fkey` FOREIGN KEY (`gstExemptFileId`) REFERENCES `FileUpload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AirWayBill` ADD CONSTRAINT `AirWayBill_AWBPdf_fkey` FOREIGN KEY (`AWBPdf`) REFERENCES `FileUpload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripCheckIn` ADD CONSTRAINT `TripCheckIn_odometerImgId_fkey` FOREIGN KEY (`odometerImgId`) REFERENCES `FileUpload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPSImages` ADD CONSTRAINT `DEPSImages_depsId_fkey` FOREIGN KEY (`depsId`) REFERENCES `DEPS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPSImages` ADD CONSTRAINT `DEPSImages_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `FileUpload`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `User` DROP COLUMN `isActive`,
    ADD COLUMN `isActiveUser` BOOLEAN NOT NULL DEFAULT true;
