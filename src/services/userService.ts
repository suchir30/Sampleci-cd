import bcrypt from 'bcrypt';

import prisma from '../client';
import logger from '../scripts/logger';
import { AuthUserDetails } from '../types/authTypes';
import { Prisma } from '@prisma/client';

export const validateUser = async (employeeId: string, password: string): Promise<{ isValid: boolean; user?: AuthUserDetails }> => {
  const user = await prisma.user.findUnique({
    where: { employeeId },
    select: {
      id: true,
      roleId: true,
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
    userId: user.id,
    roleId: user.roleId,
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

export const checkIfUserExists = async (employeeId: string): Promise<{ exists: boolean, phoneNumber?: string | null }> => {
  if (!employeeId) {
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
  if (!password || !userId) {
    return false
  }
  await prisma.user.update({
    where: { employeeId: (userId) },
    data: { hashedPassword },
  });
  return true;
};

Prisma.HLFLineItemScalarFieldEnum

const rolePermissionsSelect = {
  select:
  {
    id: true,
    name: true,
    CRMTablePermissions: {
      select: {
        CRMTable: {
          select: {
            id: true,
            name: true,
          }
        },
        can_add: true,
        can_read: true,
        can_delete: true,
        can_edit: true,
      }
    },
    CRMColumnPermissions: {
      select: {
        CRMColumn: {
          select: {
            id: true,
            name: true,
            CRMTable: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        can_read: true,
        can_edit: true,
      }
    }
  }
};

export type RolePermissions = Prisma.RoleGetPayload<typeof rolePermissionsSelect>

export const getRolePermissions = async (roleId: number) => {
  return await prisma.role.findUnique({
    where: {
      id: roleId,
    },
    ...rolePermissionsSelect
  });
};