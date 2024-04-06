-- AlterTable
ALTER TABLE `consignor` ADD COLUMN `gstId` INTEGER NULL;

-- CreateTable
CREATE TABLE `GstMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GstMaster_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_gstId_fkey` FOREIGN KEY (`gstId`) REFERENCES `GstMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
