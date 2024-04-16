-- CreateTable
CREATE TABLE `TripDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tripCode` VARCHAR(255) NOT NULL,
    `route` VARCHAR(255) NULL,
    `costPerKg` VARCHAR(255) NULL,
    `localTripNumber` VARCHAR(255) NULL,
    `vendorId` INTEGER NULL,
    `vehicleId` INTEGER NULL,
    `driverId` INTEGER NULL,
    `ftlLocalNumber` VARCHAR(255) NULL,
    `originBranchId` INTEGER NULL,
    `numberOfAwb` INTEGER NULL,
    `numberOfArticles` INTEGER NULL,
    `chargedWeight` FLOAT NULL,
    `hireAmount` FLOAT NULL,
    `advanceAmount` FLOAT NULL,
    `tdsAmount` FLOAT NULL,
    `balance` FLOAT NULL,
    `openingKms` FLOAT NULL,
    `closingKms` FLOAT NULL,
    `totalKms` FLOAT NULL,
    `tripClosingTime` DATETIME(3) NULL,
    `documentStatus` VARCHAR(255) NULL,
    `invoiceStatus` VARCHAR(255) NULL,
    `remarks` VARCHAR(255) NULL,
    `paymentReqDate` DATETIME(3) NULL,
    `utrDetails` VARCHAR(255) NULL,
    `ePODsCleared` BOOLEAN NULL,
    `originalPODReceived` BOOLEAN NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    UNIQUE INDEX `TripDetails_tripCode_key`(`tripCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TripCheckIn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tripId` INTEGER NOT NULL,
    `type` ENUM('Inward', 'Outward') NOT NULL,
    `locationBranchId` INTEGER NOT NULL,
    `odometerReading` INTEGER NOT NULL,
    `time` DATETIME(3) NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TripLineItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `AWBId` INTEGER NOT NULL,
    `tripId` INTEGER NOT NULL,
    `nextDestinationId` INTEGER NOT NULL,
    `finalDestinationId` INTEGER NOT NULL,
    `status` ENUM('Assigned', 'Open', 'Closed', 'Delivered') NOT NULL DEFAULT 'Assigned',
    `ePODReceived` BOOLEAN NOT NULL,
    `originalPODReceived` BOOLEAN NOT NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VendorMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendorCode` VARCHAR(255) NOT NULL,
    `publicName` VARCHAR(255) NULL,
    `vendorName` VARCHAR(255) NULL,
    `address1` VARCHAR(255) NULL,
    `cityId` INTEGER NULL,
    `stateId` INTEGER NULL,
    `Pincode` VARCHAR(255) NULL,
    `gstNumber` VARCHAR(255) NULL,
    `panNumber` VARCHAR(255) NULL,
    `contactPerson` VARCHAR(255) NULL,
    `phone1` VARCHAR(255) NULL,
    `phone2` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `accountHolderName` VARCHAR(255) NULL,
    `bankName` VARCHAR(255) NULL,
    `branchName` VARCHAR(255) NULL,
    `bankAddress` VARCHAR(255) NULL,
    `branchPincode` INTEGER NULL,
    `accountNumber` INTEGER NULL,
    `ifscCode` VARCHAR(255) NULL,
    `tanNumber` VARCHAR(255) NULL,
    `servicesOffered` VARCHAR(255) NULL,
    `tdsPercentageSlab` VARCHAR(255) NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    UNIQUE INDEX `VendorMaster_vendorCode_key`(`vendorCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleNum` VARCHAR(255) NOT NULL,
    `vehicleType` VARCHAR(255) NULL,
    `vehicleCapacity` VARCHAR(255) NULL,
    `vehiclePermit` VARCHAR(255) NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,
    `vendorId` INTEGER NULL,

    UNIQUE INDEX `VehicleMaster_vehicleNum_key`(`vehicleNum`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DriverMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `driverName` VARCHAR(255) NOT NULL,
    `phone1` VARCHAR(255) NULL,
    `licenseNumber` VARCHAR(255) NULL,
    `panNumber` VARCHAR(255) NULL,
    `aadharNumber` VARCHAR(255) NULL,
    `address1` VARCHAR(255) NULL,
    `cityId` INTEGER NULL,
    `stateId` INTEGER NULL,
    `districtId` INTEGER NULL,
    `Pincode` INTEGER NULL,
    `phone2` INTEGER NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `VendorMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `VehicleMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `DriverMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripDetails` ADD CONSTRAINT `TripDetails_originBranchId_fkey` FOREIGN KEY (`originBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripCheckIn` ADD CONSTRAINT `TripCheckIn_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `TripDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripCheckIn` ADD CONSTRAINT `TripCheckIn_locationBranchId_fkey` FOREIGN KEY (`locationBranchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripLineItem` ADD CONSTRAINT `TripLineItem_AWBId_fkey` FOREIGN KEY (`AWBId`) REFERENCES `AirWayBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripLineItem` ADD CONSTRAINT `TripLineItem_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `TripDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripLineItem` ADD CONSTRAINT `TripLineItem_nextDestinationId_fkey` FOREIGN KEY (`nextDestinationId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripLineItem` ADD CONSTRAINT `TripLineItem_finalDestinationId_fkey` FOREIGN KEY (`finalDestinationId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VendorMaster` ADD CONSTRAINT `VendorMaster_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `CityMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VendorMaster` ADD CONSTRAINT `VendorMaster_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `StateMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleMaster` ADD CONSTRAINT `VehicleMaster_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `VendorMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DriverMaster` ADD CONSTRAINT `DriverMaster_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `CityMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DriverMaster` ADD CONSTRAINT `DriverMaster_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `StateMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DriverMaster` ADD CONSTRAINT `DriverMaster_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `DistrictMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
