import { Consignee } from '@prisma/client';
import { generateRandomCode } from '../scripts/randomGenerator';

import prisma from '../client';

export const getConsignees = async () => {
  const consignees = await prisma.consignee.findMany({
    include: {
      consignor: true,
      city: true,
      district: true,
      state: true,
      branch: true
    }

  });
  return consignees;
}

// export const createConsignees = async (consigneesData: Consignee[]) => {
//   const consignees = await prisma.consignee.createMany({
//     data: consigneesData,
//   });
//   return consignees;
// };

export const createConsignees = async (consigneesData: Consignee[]) => {
  try {
  
    for (const consignee of consigneesData) {
      
      if (!consignee.consigneeCode) {
        let codeExists = true;
        let randomCode = '';
        while (codeExists) {
         randomCode =generateRandomCode(6);
          const existingConsignee = await prisma.consignee.findFirst({
            where: { consigneeCode: randomCode }
          });
          if (!existingConsignee) {
            codeExists = false;
          }
        }
        consignee.consigneeCode = randomCode;
      }
      else{
        const givenConsignorExists = await prisma.consignee.findFirst({
          where: { consigneeCode:consignee.consigneeCode}
        });
     
        if(givenConsignorExists!=null){
          return "alreadyExists";
        }
      }
    }

    const newConsignors = await prisma.consignee.createMany({
      data: consigneesData,
    });

    return newConsignors;
  } catch (error) {
    // Handle any errors
    console.error('Error creating consignees:', error);
    throw error;
  }
};

