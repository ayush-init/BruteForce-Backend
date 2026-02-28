import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';

// Student Registration
export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, username, password } = req.body;

    // Validation
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check existing user
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingStudent) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        email,
        username,
        password_hash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        is_profile_complete: true,
        created_at: true,
      },
    });

    // Generate token
    const token = generateToken({
      id: student.id,
      email: student.email,
      role: 'student',
      userType: 'student',
    });

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: student,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register student' });
  }
};

// Student Login
export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { email },
      include: {
        city: true,
        batch: true,
      },
    });

    if (!student || !student.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isValidPassword = await comparePassword(password, student.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: student.id,
      email: student.email,
      role: 'student',
      userType: 'student',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        username: student.username,
        city: student.city,
        batch: student.batch,
        is_profile_complete: student.is_profile_complete,
        leetcode_id: student.leetcode_id,
        gfg_id: student.gfg_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Admin/Teacher Registration
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check existing admin
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    if (req.user?.role !== "SUPERADMIN") {
      return res.status(403).json({ error: "Only SuperAdmin can create admin" });
    }

    if (role !== "TEACHER" && role !== "INTERN") {
      return res.status(400).json({ error: "Invalid role type" });
    }
    const password_hash = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        username,
        password_hash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        created_at: true,
      },
    });

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      userType: 'admin',
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: admin,
    });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(500).json({ error: 'Failed to register admin' });
  }
};


// Admin Login
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      userType: 'admin',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};


