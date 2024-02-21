-- AlterTable
ALTER TABLE `User` ADD COLUMN `address1` VARCHAR(255) NULL,
    ADD COLUMN `address2` VARCHAR(255) NULL,
    ADD COLUMN `cityId` INTEGER NULL,
    ADD COLUMN `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `districtId` INTEGER NULL,
    ADD COLUMN `email` VARCHAR(255) NULL,
    ADD COLUMN `firstName` VARCHAR(255) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `lastName` VARCHAR(255) NULL,
    ADD COLUMN `phone1` VARCHAR(255) NULL,
    ADD COLUMN `phone2` VARCHAR(255) NULL,
    ADD COLUMN `profile` VARCHAR(255) NULL,
    ADD COLUMN `role` VARCHAR(255) NULL,
    ADD COLUMN `stateId` INTEGER NULL,
    ADD COLUMN `title` VARCHAR(255) NULL,
    MODIFY `employeeId` VARCHAR(255) NOT NULL,
    MODIFY `hashedPassword` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchCode` VARCHAR(255) NOT NULL,
    `branchName` VARCHAR(255) NOT NULL,
    `address1` VARCHAR(255) NULL,
    `address2` VARCHAR(255) NULL,
    `cityId` INTEGER NULL,
    `districtId` INTEGER NULL,
    `stateId` INTEGER NULL,
    `phone1` VARCHAR(255) NULL,
    `phone2` VARCHAR(255) NULL,
    `isHub` BOOLEAN NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Branch_branchCode_key`(`branchCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Consignor` (
    `consignorId` INTEGER NOT NULL AUTO_INCREMENT,
    `consignorCode` VARCHAR(191) NOT NULL,
    `publicName` VARCHAR(255) NULL,
    `legalName` VARCHAR(255) NULL,
    `industryTypeId` INTEGER NULL,
    `commodityId` INTEGER NULL,
    `address1` VARCHAR(255) NULL,
    `address2` VARCHAR(255) NULL,
    `cityId` INTEGER NULL,
    `districtId` INTEGER NULL,
    `stateId` INTEGER NULL,
    `gstNumber` VARCHAR(255) NULL,
    `panNumber` VARCHAR(255) NULL,
    `tanNumber` VARCHAR(255) NULL,
    `cinNumber` VARCHAR(255) NULL,
    `taxCategory` VARCHAR(255) NULL,
    `parentConsignorId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `keyContactName` VARCHAR(255) NULL,
    `keyContactDesignation` VARCHAR(255) NULL,
    `keyContactAddress` VARCHAR(255) NULL,
    `distanceFromBranchKms` INTEGER NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    UNIQUE INDEX `Consignor_consignorCode_key`(`consignorCode`),
    PRIMARY KEY (`consignorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Consignee` (
    `consigneeId` INTEGER NOT NULL AUTO_INCREMENT,
    `consignorId` INTEGER NOT NULL,
    `consigneeCode` VARCHAR(255) NOT NULL,
    `consigneeName` VARCHAR(255) NOT NULL,
    `phone1` VARCHAR(255) NULL,
    `phone2` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `address1` VARCHAR(255) NULL,
    `address2` VARCHAR(255) NULL,
    `cityId` INTEGER NULL,
    `districtId` INTEGER NULL,
    `stateId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `distanceToBranchKms` INTEGER NULL,
    `odaType` VARCHAR(255) NULL,
    `tatNumber` INTEGER NULL,
    `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedOn` DATETIME(3) NULL,

    UNIQUE INDEX `Consignee_consigneeCode_key`(`consigneeCode`),
    PRIMARY KEY (`consigneeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndustryTypeMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `IndustryTypeMaster_value_key`(`value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommodityMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CommodityMaster_value_key`(`value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PincodesMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PincodesMaster_value_key`(`value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CityMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CityMaster_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DistrictMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DistrictMaster_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StateMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `StateMaster_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `CityMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `DistrictMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `StateMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `CityMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `DistrictMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `StateMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_industryTypeId_fkey` FOREIGN KEY (`industryTypeId`) REFERENCES `IndustryTypeMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `CommodityMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `CityMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `DistrictMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `StateMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_parentConsignorId_fkey` FOREIGN KEY (`parentConsignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignor` ADD CONSTRAINT `Consignor_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignee` ADD CONSTRAINT `Consignee_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Consignor`(`consignorId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignee` ADD CONSTRAINT `Consignee_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `CityMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignee` ADD CONSTRAINT `Consignee_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `DistrictMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignee` ADD CONSTRAINT `Consignee_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `StateMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Consignee` ADD CONSTRAINT `Consignee_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
