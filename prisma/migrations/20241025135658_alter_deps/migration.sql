/*
  Warnings:

  - You are about to drop the column `DEPSSubType` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `TicketRaisedBranchId` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `caseComment` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `connectedDate` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `loadingHubId` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `loadingUserId` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfDepsArticles` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `sealNumber` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `tripIdRoute` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `unloadingUserId` on the `DEPS` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleNumberId` on the `DEPS` table. All the data in the column will be lost.
  - The values [Cleared] on the enum `DEPS_depsStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `articleId` to the `DEPS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scanType` to the `DEPS` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_TicketRaisedBranchId_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_loadingHubId_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_loadingUserId_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_tripIdRoute_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_unloadingUserId_fkey`;

-- DropForeignKey
ALTER TABLE `DEPS` DROP FOREIGN KEY `DEPS_vehicleNumberId_fkey`;

-- AlterTable
ALTER TABLE `AirWayBill` ADD COLUMN `rollupDamageCount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `rollupDepsCount` INTEGER NULL,
    ADD COLUMN `rollupExcessCount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `rollupPilferageCount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `rollupShortCount` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `DEPS` DROP COLUMN `DEPSSubType`,
    DROP COLUMN `TicketRaisedBranchId`,
    DROP COLUMN `caseComment`,
    DROP COLUMN `connectedDate`,
    DROP COLUMN `loadingHubId`,
    DROP COLUMN `loadingUserId`,
    DROP COLUMN `numberOfDepsArticles`,
    DROP COLUMN `sealNumber`,
    DROP COLUMN `tripIdRoute`,
    DROP COLUMN `unloadingUserId`,
    DROP COLUMN `vehicleNumberId`,
    ADD COLUMN `articleId` INTEGER NOT NULL,
    ADD COLUMN `hubId` INTEGER NULL,
    ADD COLUMN `scanType` ENUM('Load', 'Unload', 'Deleted') NOT NULL,
    ADD COLUMN `tripId` INTEGER NULL,
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `depsStatus` ENUM('Open', 'Closed') NULL;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `AwbArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_hubId_fkey` FOREIGN KEY (`hubId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `TripDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
