import { Consignee, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  const consignees = await prisma.consignee.createMany({
    data: consigneesData,
  });
  return consignees;
};