-- AlterTable
ALTER TABLE `DEPS` ADD COLUMN `unloadLocationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `POD` MODIFY `response` VARCHAR(255) NULL;

-- AddForeignKey
ALTER TABLE `DEPS` ADD CONSTRAINT `DEPS_unloadLocationId_fkey` FOREIGN KEY (`unloadLocationId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
