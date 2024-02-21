import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getConsignees = async () => {
  try {
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
  } catch (error) {
    console.error('Error retrieving consignees:', error);
    throw error;
  }
}

export const createConsignees = async (consigneesData: []) => {
  try {
    const consignees = await prisma.consignee.createMany({
      data: consigneesData,
    });
    return consignees;
  } catch (error) {
    console.error('Error creating consignees:', error);
    throw error;
  }
};