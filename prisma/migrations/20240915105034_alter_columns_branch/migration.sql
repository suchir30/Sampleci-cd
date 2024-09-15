ALTER TABLE `Branch` MODIFY `isHub` BOOLEAN NULL DEFAULT false;
ALTER TABLE `Branch` CHANGE `isWareHouse` `isConsignorPickupPoint` BOOLEAN NULL;
