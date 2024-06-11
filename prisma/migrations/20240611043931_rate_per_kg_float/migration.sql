/*
  Warnings:

  - You are about to alter the column `ratePerKg` on the `ConsignorRateTable` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `ConsignorRateTable` MODIFY `ratePerKg` DOUBLE NULL;
