import { PrismaClient } from "@prisma/client";
import prisma from "../client";
import { RolePermissions, getRolePermissions } from "../services/userService";
import { AuthUserDetails, AuthRequest } from "../types/authTypes";
import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4";

export interface GraphQLContext {
    prisma: PrismaClient;
    user: AuthUserDetails | null;
    permissions: RolePermissions | null;
}

export async function buildGraphQLContext({req}: ExpressContextFunctionArgument) {
    if (req.originalUrl.includes('/graphql')) {
        return { prisma, user: null, permissions: null };
    }
    if (process.env.USE_TOKEN_AUTH === '0') {
        return {prisma, user: null, permissions: null};
    }
    const user  = (req as AuthRequest).user || null;
    let permissions = null;
    if (!user || !user.roleId) {
        throw new Error("User role is not available.");
    }
    permissions = await getRolePermissions(user.roleId);
    return {prisma, user, permissions};
}