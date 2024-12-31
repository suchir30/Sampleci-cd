/*
  Warnings:

  - A unique constraint covering the columns `[AWBCode]` on the table `AirWayBill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AirWayBill_AWBCode_key` ON `AirWayBill`(`AWBCode`);
