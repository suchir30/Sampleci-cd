-- AlterTable
ALTER TABLE `AirWayBill` MODIFY `AWBStatus` ENUM('PickUp', 'InTransit', 'atHub', 'outForDelivery', 'Delivered', 'Deleted') NOT NULL DEFAULT 'PickUp';

-- AlterTable
ALTER TABLE `AwbArticleTripLogs` MODIFY `scanType` ENUM('Load', 'Unload', 'Deleted') NOT NULL;
