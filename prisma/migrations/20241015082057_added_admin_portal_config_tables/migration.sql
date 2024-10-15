/*
  Warnings:

  - You are about to drop the `CRMColumn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMColumnPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMTablePermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CRMColumn` DROP FOREIGN KEY `CRMColumn_CRMTableId_fkey`;

-- DropForeignKey
ALTER TABLE `CRMColumnPermission` DROP FOREIGN KEY `CRMColumnPermission_CRMColumnId_fkey`;

-- DropForeignKey
ALTER TABLE `CRMColumnPermission` DROP FOREIGN KEY `CRMColumnPermission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `CRMTablePermission` DROP FOREIGN KEY `CRMTablePermission_CRMTableId_fkey`;

-- DropForeignKey
ALTER TABLE `CRMTablePermission` DROP FOREIGN KEY `CRMTablePermission_roleId_fkey`;

-- DropTable
DROP TABLE `CRMColumn`;

-- DropTable
DROP TABLE `CRMColumnPermission`;

-- DropTable
DROP TABLE `CRMTable`;

-- DropTable
DROP TABLE `CRMTablePermission`;

-- CreateTable
CREATE TABLE `CRMObject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `viewName` VARCHAR(191) NULL,
    `viewIndex` INTEGER NULL,
    `CRMObjectGroupId` INTEGER NOT NULL,

    UNIQUE INDEX `CRMObject_viewIndex_key`(`viewIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CRMField` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `viewName` VARCHAR(191) NULL,
    `ViewIndex` INTEGER NULL,
    `isRelation` BOOLEAN NOT NULL DEFAULT false,
    `idFieldName` VARCHAR(191) NULL,
    `labelFieldName` VARCHAR(191) NULL,
    `isInCreateView` BOOLEAN NOT NULL DEFAULT false,
    `isInListView` BOOLEAN NOT NULL DEFAULT false,
    `isInEditView` BOOLEAN NOT NULL DEFAULT false,
    `isInDetailView` BOOLEAN NOT NULL DEFAULT false,
    `isInRelatedList` BOOLEAN NOT NULL DEFAULT false,
    `isSearchableField` BOOLEAN NOT NULL DEFAULT false,
    `filterView` BOOLEAN NOT NULL DEFAULT false,
    `CRMObjectId` INTEGER NOT NULL,

    UNIQUE INDEX `CRMField_ViewIndex_key`(`ViewIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CRMObjectGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `viewName` VARCHAR(191) NOT NULL,
    `viewIndex` INTEGER NOT NULL,

    UNIQUE INDEX `CRMObjectGroup_viewIndex_key`(`viewIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CRMObjectRelations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `primaryObjectId` INTEGER NOT NULL,
    `relatedObjectId` INTEGER NOT NULL,
    `viewIndex` INTEGER NULL,
    `isInRelatedListView` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `CRMObjectRelations_viewIndex_key`(`viewIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CRMObjectPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `CRMObjectId` INTEGER NOT NULL,
    `can_read` BOOLEAN NOT NULL DEFAULT false,
    `can_edit` BOOLEAN NOT NULL DEFAULT false,
    `can_add` BOOLEAN NOT NULL DEFAULT false,
    `can_delete` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CRMFieldPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `CRMFieldId` INTEGER NOT NULL,
    `can_read` BOOLEAN NOT NULL DEFAULT false,
    `can_edit` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CRMObject` ADD CONSTRAINT `CRMObject_CRMObjectGroupId_fkey` FOREIGN KEY (`CRMObjectGroupId`) REFERENCES `CRMObjectGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CRMField` ADD CONSTRAINT `CRMField_CRMObjectId_fkey` FOREIGN KEY (`CRMObjectId`) REFERENCES `CRMObject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CRMObjectRelations` ADD CONSTRAINT `CRMObjectRelations_primaryObjectId_fkey` FOREIGN KEY (`primaryObjectId`) REFERENCES `CRMObject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CRMObjectRelations` ADD CONSTRAINT `CRMObjectRelations_relatedObjectId_fkey` FOREIGN KEY (`relatedObjectId`) REFERENCES `CRMObject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CRMObjectPermission` ADD CONSTRAINT `CRMObjectPermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CRMObjectPermission` ADD CONSTRAINT `CRMObjectPermission_CRMObjectId_fkey` FOREIGN KEY (`CRMObjectId`) REFERENCES `CRMObject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CRMFieldPermission` ADD CONSTRAINT `CRMFieldPermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CRMFieldPermission` ADD CONSTRAINT `CRMFieldPermission_CRMFieldId_fkey` FOREIGN KEY (`CRMFieldId`) REFERENCES `CRMField`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
