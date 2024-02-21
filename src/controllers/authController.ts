import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import * as userService from '../services/userService';

export const login = async (req: Request, res: Response) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res.status(400).send('Employee ID and password are required');
  }

  const isValidUser = await userService.validateUser(employeeId, password);
  if (!isValidUser) {
    return res.send({status:401,message:'Invalid credentials'});
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in the environment');
  }
  const token = jwt.sign({ employeeId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

export const generateOTP = async (req: Request, res: Response) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  const { exists, phoneNumber } = await userService.checkIfUserExists(employeeId);

  if (!exists) {
    return res.status(401).json({ error: 'Invalid Employee ID. Not a legit User' });
  }

  try {
    res.status(200).json({ message: 'OTP sent successfully', phoneNumber });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ error: 'Error generating OTP' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { otp } = req.body;

  if (otp === '654321') {
    return res.status(200).send('OTP verified successfully');
  } else {
    return res.status(400).send('Invalid OTP');
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).send('User ID and new password are required');
  }

  try {
    await userService.updateUserPassword(userId, password);
    res.status(200).send('Password changed successfully');
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).send('Error changing password');
  }
};

