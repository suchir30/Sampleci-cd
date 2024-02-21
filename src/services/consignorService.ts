import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getConsignors = async () => {
  try {
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
  } catch (error) {
    console.error('Error retrieving consignors:', error);
    throw error;
  }
}

export const createConsignors = async (consignorsData: []) => {
  try {
    const newConsignor = await prisma.consignor.createMany({
      data: consignorsData,
    });
    return newConsignor;
  } catch (error) {
    console.error('Error creating consignors:', error);
    throw error;
  }
};