/*
  Warnings:

  - You are about to drop the column `AWBLineItemId` on the `awblineitem` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `tripcheckin` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(5))`.
  - Made the column `time` on table `tripcheckin` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `AirWayBill` ADD COLUMN `appointmentDate` DATETIME(3) NULL,
    ADD COLUMN `articleGenFlag` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `contractTypeId` INTEGER NULL,
    ADD COLUMN `rollupArticleCnt` INTEGER NULL,
    ADD COLUMN `rollupChargedWtInKgs` FLOAT NULL,
    ADD COLUMN `subTotal` FLOAT NULL;

-- AlterTable
ALTER TABLE `AwbLineItem` DROP COLUMN `AWBLineItemId`,
    MODIFY `lineItemDescription` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `TripCheckIn` MODIFY `type` ENUM('Inwarded', 'Outwarded') NOT NULL DEFAULT 'Inwarded',
    MODIFY `time` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `TripDetails` ADD COLUMN `latestCheckinHubId` INTEGER NULL,
    ADD COLUMN `latestCheckinTime` DATETIME(3) NULL,
    ADD COLUMN `latestCheckinType` ENUM('Inwarded', 'Outwarded') NULL,
    ADD COLUMN `tripStatus` ENUM('Open', 'CompletedWithRemarks', 'Closed') NOT NULL DEFAULT 'Open';

-- AlterTable
ALTER TABLE `TripLineItem` MODIFY `ePODReceived` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `originalPODReceived` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `AirWayBill` ADD CONSTRAINT `AirWayBill_contractTypeId_fkey` FOREIGN KEY (`contractTypeId`) REFERENCES `Contract`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_latestCheckinHubId_fkey` FOREIGN KEY (`latestCheckinHubId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
