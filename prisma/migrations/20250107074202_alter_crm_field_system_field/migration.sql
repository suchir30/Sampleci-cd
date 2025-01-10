-- AlterTable
ALTER TABLE `CRMField` ADD COLUMN `systemField` ENUM('DBGenerated', 'CodeGenerated') NULL;
