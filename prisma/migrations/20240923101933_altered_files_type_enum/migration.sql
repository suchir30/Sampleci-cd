-- AlterTable
ALTER TABLE `FileUpload` MODIFY `type` ENUM('DEPS', 'AWB', 'GST', 'ShippingLabel', 'TripCheckin', 'LoadingSheet', 'UnloadingSheet', 'HireLetter', 'POD') NULL;
