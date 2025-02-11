-- AlterTable
ALTER TABLE `awbarticletriplogs` ADD COLUMN `checkinHubId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AwbArticleTripLogs` ADD CONSTRAINT `AwbArticleTripLogs_checkinHubId_fkey` FOREIGN KEY (`checkinHubId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
