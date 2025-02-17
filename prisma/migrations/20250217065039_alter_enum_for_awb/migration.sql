-- AlterTable
ALTER TABLE `AirWayBill` MODIFY `AWBStatus` ENUM('PickUp', 'InTransit', 'atHub', 'outForDelivery', 'Delivered', 'Deleted', 'Cancelled') NOT NULL DEFAULT 'PickUp';
