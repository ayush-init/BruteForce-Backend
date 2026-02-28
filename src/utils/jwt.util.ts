import jwt from 'jsonwebtoken';
import { AdminRole } from '@prisma/client';

interface TokenPayload {
  id: number;
  email: string;
  role: 'student' | AdminRole;
  userType: 'student' | 'admin';
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};