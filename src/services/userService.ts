import bcrypt from 'bcrypt';

import prisma from '../client';

export const validateUser = async (employeeId: string, password: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { employeeId } });
  if (!user) return false;

  return bcrypt.compare(password, user.hashedPassword);
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