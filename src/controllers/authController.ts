import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import * as userService from '../services/userService';
import { buildNoContentRepsonse, buildObjectFetchRepsonse, throwValidationError,APIError } from '../utils/apiUtils';
import { HttpStatusCode } from '../types/apiTypes';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return throwValidationError([{ message: "Employee ID and password are required" }]);
    }

    const isValidUser = await userService.validateUser(employeeId, password);
    if (!isValidUser) {
      return throwValidationError([{ message: "Invalid Credentials" }]);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in the environment');
    }
    const token = jwt.sign({ employeeId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(HttpStatusCode.OK).json(buildObjectFetchRepsonse({ token }));
    
  } catch (err) {
    console.log("Error login", err);
    if (err instanceof APIError && err.errorCode === HttpStatusCode.BadRequest) {
      res.status(HttpStatusCode.BadRequest).json({ message: err.message });
    } else {
      next(err);
    }
  }
};


export const generateOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      throwValidationError([{ message: "Employee ID is required" }]);
    }

    const { exists, phoneNumber } = await userService.checkIfUserExists(employeeId);

    if (!exists) {
      throwValidationError([{ message: "Invalid Employee ID" }]);
    }

    res.status(HttpStatusCode.OK).json(buildObjectFetchRepsonse({ phoneNumber }, 'OTP sent successfully'));
  } catch (err) {
    if (err instanceof APIError && err.errorCode === HttpStatusCode.BadRequest) {
      res.status(HttpStatusCode.BadRequest).json({ message: err.message });
    } else {
      next(err);
    }
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp } = req.body;
    if (otp === '654321') {
      return res.status(HttpStatusCode.OK).send(buildNoContentRepsonse("OTP Verification Successful"));
    } else {
      throwValidationError([{ message: "Invalid OTP" }]);
    }
  } catch (err) {
    if (err instanceof APIError && err.errorCode === HttpStatusCode.BadRequest) {
      res.status(HttpStatusCode.BadRequest).json({ message: err.message });
    } else {
      next(err);
    }
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      throwValidationError([{ message: 'User ID and new password are required' }]);
    }
    await userService.updateUserPassword(userId, password);
    res.status(HttpStatusCode.OK).send(buildNoContentRepsonse("Password changed successfully"));
  } catch (err) {
    if (err instanceof APIError && err.errorCode === HttpStatusCode.BadRequest) {
      res.status(HttpStatusCode.BadRequest).json({ message: err.message });
    } else {
      if (err instanceof APIError && err.errorCode === HttpStatusCode.BadRequest) {
        res.status(HttpStatusCode.BadRequest).json({ message: err.message });
      } else {
        next(err);
      }
    }
  }
};

