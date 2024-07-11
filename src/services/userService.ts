import bcrypt from 'bcrypt';

import prisma from '../client';
import logger from '../scripts/logger';

export const validateUser = async (employeeId: string, password: string): Promise<{ isValid: boolean; user?: { firstName: string | null; lastName: string | null; employeeId: string } }> => {
  const user = await prisma.user.findUnique({ 
    where: { employeeId },
    select: {
      employeeId: true,
      hashedPassword: true,
      firstName: true,
      lastName: true,
    }
  });

  if (!user) return { isValid: false };

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isPasswordValid) return { isValid: false };

  const validatedUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    employeeId: user.employeeId
  };

  logger.info(`User validated, Welcome: ${user.firstName}`);

  return { 
    isValid: true, 
    user: validatedUser
  };
};

export const checkIfUserExists = async (employeeId: string): Promise<{ exists: boolean, phoneNumber?: string|null }> => {
  if(!employeeId){
    return { exists: false };
  }
  const user = await prisma.user.findUnique({ where: { employeeId } });
  if (!user) return { exists: false };
  return { exists: true, phoneNumber: user.phone1 };
};

export const createUser = async (employeeId: string, password: string, phoneNumber: string): Promise<boolean> => {
  try {
    if (!employeeId || !password || !phoneNumber) {
      return false;
    }

    const existingUser = await prisma.user.findUnique({
      where: { employeeId },
    });

    if (existingUser) {
      return false; 
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        employeeId,
        hashedPassword,
        phone1: phoneNumber,
      },
    });
    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
};
export const updateUserPassword = async (userId: string, password: string): Promise<boolean> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  if(!password || !userId){
    return false
  }
  await prisma.user.update({
    where: { employeeId: (userId) },
    data: { hashedPassword },
  });
  return true;
};