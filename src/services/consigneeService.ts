import { Consignee } from '@prisma/client';
import { generateRandomCode } from '../scripts/randomGenerator';

import prisma from '../client';

export const getConsignees = async (consignorId:number,toBranchId:number) => {
  const consignees = await prisma.consignee.findMany({
    where: {
      consignorId: consignorId,
      branchId: {
        equals: toBranchId !== null ? toBranchId : undefined,
      },
    },
    select:{
      consigneeId:true,
      consigneeCode:true,
      consigneeName:true,
      address1:true,
      branchId:true,
      consignorId:true,
      cityId:true,
      stateId:true,
      districtId:true,
      consignor:{
        select:{
          consignorId:true,
          consignorCode:true,
          publicName:true,
          address1:true
        }
      },
      city:{
        select:{
          id:true,
          name:true
        }
      },
      district:{
        select:{
          id:true,
          name:true
        }
      },
      state:{
        select:{
          id:true,
          name:true
        }
      },
      branch:{
        select:{
          id:true,
          branchCode:true,
          branchName:true
        }
      }

    },
    // include: {
    //   consignor: true,
    //   city: true,
    //   district: true,
    //   state: true,
    //   branch: true
    // },
    orderBy: {
      consigneeName: 'asc'  // sort the results by publicName in ascending order
    }

  });
  return consignees;
}

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
