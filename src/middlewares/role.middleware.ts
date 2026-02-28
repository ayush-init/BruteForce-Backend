import { Request, Response, NextFunction } from 'express';
import { AdminRole } from '@prisma/client';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.userType !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.userType !== 'admin' || req.user?.role !== AdminRole.SUPERADMIN) {
    return res.status(403).json({ error: 'Access denied. Superadmin only.' });
  }
  next();
};

export const isTeacherOrAbove = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.user?.userType !== 'admin' ||
    (req.user?.role !== AdminRole.SUPERADMIN && req.user?.role !== AdminRole.TEACHER)
  ) {
    return res.status(403).json({ error: 'Access denied. Teacher or Superadmin only.' });
  }
  next();
};

export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.userType !== 'student') {
    return res.status(403).json({ error: 'Access denied. Students only.' });
  }
  next();
};