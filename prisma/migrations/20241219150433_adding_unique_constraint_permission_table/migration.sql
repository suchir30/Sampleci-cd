/*
  Warnings:

  - A unique constraint covering the columns `[roleId,CRMFieldId]` on the table `CRMFieldPermission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleId,CRMObjectId]` on the table `CRMObjectPermission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CRMFieldPermission_roleId_CRMFieldId_key` ON `CRMFieldPermission`(`roleId`, `CRMFieldId`);

-- CreateIndex
CREATE UNIQUE INDEX `CRMObjectPermission_roleId_CRMObjectId_key` ON `CRMObjectPermission`(`roleId`, `CRMObjectId`);

-- CreateIndex
CREATE UNIQUE INDEX `Role_name_key` ON `Role`(`name`);
