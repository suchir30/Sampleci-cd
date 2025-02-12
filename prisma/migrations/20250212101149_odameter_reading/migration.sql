-- AlterTable
ALTER TABLE `CRMField` ADD COLUMN `isFormRequired` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `TripCheckIn` MODIFY `odometerReading` INTEGER NULL;
