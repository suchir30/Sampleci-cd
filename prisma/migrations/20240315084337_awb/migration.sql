-- CreateTable
CREATE TABLE `AirWayBill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `AWBCode` VARCHAR(255) NOT NULL,
    `consignorId` INTEGER NOT NULL,
    `consigneeId` INTEGER NULL,
    `fromBranchId` INTEGER NOT NULL,
    `toBranchId` INTEGER NOT NULL,
    `numOfArticles` INTEGER NOT NULL,
    `invoiceNumber` INTEGER NULL,
    `invoiceValue` FLOAT NULL,
    `weightKgs` FLOAT NULL,
    `ratePerKg` FLOAT NULL,
    `rollupVolume` FLOAT NULL,
    `rollupWeight` FLOAT NULL,
    `grandTotal` FLOAT NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AwbLineItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `AWBId` INTEGER NOT NULL,
    `AWBLineItemId` INTEGER NOT NULL,
    `lineItemDescription` VARCHAR(255) NOT NULL,
    `numOfArticles` INTEGER NOT NULL,
    `ActualWeightKg` FLOAT NULL,
    `lengthCms` FLOAT NULL,
    `breadthCms` FLOAT NULL,
    `heightCms` FLOAT NULL,
    `chargedWeight` FLOAT NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AwbArticle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `AWBId` INTEGER NOT NULL,
    `articleCode` VARCHAR(255) NOT NULL,
    `articleIndex` INTEGER NOT NULL,
    `status` ENUM('CREATED', 'PRINTED', 'DELETED') NOT NULL DEFAULT 'CREATED',
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AirWayBill` ADD CONSTRAINT `AirWayBill_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AirWayBill` ADD CONSTRAINT `AirWayBill_consigneeId_fkey` FOREIGN KEY (`consigneeId`) REFERENCES `Consignee`(`consigneeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AirWayBill` ADD CONSTRAINT `AirWayBill_fromBranchId_fkey` FOREIGN KEY (`fromBranchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AirWayBill` ADD CONSTRAINT `AirWayBill_toBranchId_fkey` FOREIGN KEY (`toBranchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AwbLineItem` ADD CONSTRAINT `AwbLineItem_AWBId_fkey` FOREIGN KEY (`AWBId`) REFERENCES `AirWayBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AwbArticle` ADD CONSTRAINT `AwbArticle_AWBId_fkey` FOREIGN KEY (`AWBId`) REFERENCES `AirWayBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
