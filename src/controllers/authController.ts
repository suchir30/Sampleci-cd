import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import * as userService from '../services/userService';
import { buildNoContentResponse, buildObjectFetchResponse, throwValidationError } from '../utils/apiUtils';
import { HttpStatusCode } from '../types/apiTypes';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      throwValidationError([{ message: "Employee ID and password are required" }]);
    }

    const isValidUser = await userService.validateUser(employeeId, password);
    if (!isValidUser) {
      throwValidationError([{ message: "Invalid Credentials" }]);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in the environment');
    }
    
    const token = jwt.sign({ employeeId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const expirationTime = Date.now() + (2*24*60*60*1000); // 2 days in milliseconds

    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({ token, expirationTime      }));
  } catch (err) {
    console.log("Error login", err);
    next(err);
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

    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({ phoneNumber }, 'OTP sent successfully'));
  } catch (err) {
    console.error('Error generating OTP:', err);
    next(err);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp } = req.body;
    if (otp === '654321') {
      return res.status(HttpStatusCode.OK).send(buildNoContentResponse("OTP Verification Successful"));
    } else {
      throwValidationError([{ message: "Invalid OTP" }]);
    }
  } catch (err) {
    console.error('Error verifyOTP:', err);
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      throwValidationError([{ message: 'User ID and new password are required' }]);
    }
    await userService.updateUserPassword(userId, password);
    res.status(HttpStatusCode.OK).send(buildNoContentResponse("Password changed successfully"));
  } catch (err) {
    console.error('Error changing password:', err);
    next(err);
  }
};
