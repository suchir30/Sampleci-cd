-- CreateTable
CREATE TABLE `AwbArticleTripLogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `AWBArticleId` INTEGER NOT NULL,
    `tripId` INTEGER NOT NULL,
    `scanType` ENUM('Load', 'Unload') NOT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AwbArticleTripLogs` ADD CONSTRAINT `AwbArticleTripLogs_AWBArticleId_fkey` FOREIGN KEY (`AWBArticleId`) REFERENCES `AwbArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AwbArticleTripLogs` ADD CONSTRAINT `AwbArticleTripLogs_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `TripDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
