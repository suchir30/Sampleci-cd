import { Request } from 'express';

export interface AuthUserDetails {
    userId: number,
    roleId?: number | null,
    employeeId?: string | null,
    firstName?: string | null,
    lastName?: string | null,
}

export interface AuthRequest extends Request {
    user?: AuthUserDetails
}