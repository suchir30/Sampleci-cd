import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const validateUser = async (employeeId: string, password: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { employeeId } });
  if (!user) return false;

  return bcrypt.compare(password, user.hashedPassword);
};

export const checkIfUserExists = async (employeeId: string): Promise<{ exists: boolean, phoneNumber?: string|null }> => {
  const user = await prisma.user.findUnique({ where: { employeeId } });
  if (!user) return { exists: false };
  return { exists: true, phoneNumber: user.phone1 };
};

export const createUser = async (employeeId: string, password: string, phoneNumber: string): Promise<void> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      employeeId,
      hashedPassword,
      phone1: phoneNumber,
    },
  });
};

export const updateUserPassword = async (userId: string, password: string): Promise<void> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { employeeId: (userId) },
    data: { hashedPassword },
  });
};