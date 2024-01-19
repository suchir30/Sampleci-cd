import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const validateUser = async (employeeId: string, password: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { employeeId } });
  if (!user) return false;

  return bcrypt.compare(password, user.hashedPassword);
};

export const createUser = async (employeeId: string, password: string): Promise<void> => {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        employeeId,
        hashedPassword
      }
    });
  };
