import { Consignor } from '@prisma/client';
import { generateRandomCode } from '../scripts/randomGenerator';

import prisma from '../client';

export const getConsignors = async (consignorId:number) => {
  const whereClause = consignorId !== undefined ? { consignorId: consignorId } : {};
  const consignors = await prisma.consignor.findMany({
    where:whereClause,
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
  try {
  
    for (const consignor of consignorsData) {
      
      if (!consignor.consignorCode) {
        let codeExists = true;
        let randomCode = '';
        while (codeExists) {
         randomCode =generateRandomCode(6);
          const existingConsignor = await prisma.consignor.findFirst({
            where: { consignorCode: randomCode }
          });
          if (!existingConsignor) {
            codeExists = false;
          }
        }
        consignor.consignorCode = randomCode;
      }
      else{
        const givenConsignorExists = await prisma.consignor.findFirst({
          where: { consignorCode:consignor.consignorCode}
        });
     
        if(givenConsignorExists!=null){
          return "alreadyExists";
        }
      }
    }

    const newConsignors = await prisma.consignor.createMany({
      data: consignorsData,
    });

    return newConsignors;
  } catch (error) {
    // Handle any errors
    console.error('Error creating consignors:', error);
    throw error;
  }
};


