import { Request, Response } from 'express';
import { validateUser } from '../services/userService';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res.status(400).send('Employee ID and password are required');
  }

  const isValidUser = await validateUser(employeeId, password);
  if (!isValidUser) {
    return res.status(401).send('Invalid credentials');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in the environment');
  }
  const token = jwt.sign({ employeeId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};