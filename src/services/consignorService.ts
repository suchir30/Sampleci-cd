import { Consignor } from '@prisma/client';

import prisma from '../client';

export const getConsignors = async () => {
  const consignors = await prisma.consignor.findMany({
    include: {
      city: {
        select: { name: true }
      },
      state: true,
      industryType: {
        select: {
          value: true
        }
      },
      parentConsignor: true,
      branch: true
    }

  });
  return consignors;
}

export const createConsignors = async (consignorsData: Consignor[]) => {
  for (const row of consignorsData){
    if(!row.publicName ||!row.legalName){
      return false
    }
  }
  const newConsignor = await prisma.consignor.createMany({
    data: consignorsData,
  });
  // return newConsignor
  return true;
};