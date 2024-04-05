import { Consignee } from '@prisma/client';

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

export const createConsignees = async (consigneesData: Consignee[]) => {
  for (const row of consigneesData){
    if(!row.consignorId ||!row.consigneeCode||!row.consigneeName){
      return false
    } 
    if (row.phone1?.length!=10 || row.phone2?.length!=10|| (!row.email || !new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$").test(row.email))){
      return false
    }
  }
  const consignees = await prisma.consignee.createMany({
    data: consigneesData,
  });
  // return consignees
  return true;
};