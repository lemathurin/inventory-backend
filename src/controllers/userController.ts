import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        name,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(201).json({ token, id: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        homes: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    const homeId = user.homes.length > 0 ? user.homes[0].id : null;

    res.status(200).json({ token, id: user.id, homeId });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// NOTE: Add a check to ensure that the name is different from the current name
export const changeUserName = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };
    const { newName } = req.body;
    
    console.log("Received request to change name:", { userId, newName });
    
    if (!newName || typeof newName !== 'string') {
      return res.status(400).json({ error: 'Invalid name provided' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
      select: { id: true, name: true, email: true },
    });
    
    console.log("User updated successfully:", updatedUser);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Error changing user name:', error);
    res.status(500).json({ error: 'An error occurred while changing the user name', details: error.message });
  }
};

export const changeUserEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };
    const { newEmail } = req.body;

    console.log("Received request to change email:", { userId, newEmail });

    if (!newEmail || typeof newEmail !== 'string' || !isValidEmail(newEmail)) {
      return res.status(400).json({ error: 'Invalid email provided' });
    }

    // Check if the new email is already in use
    const existingUser = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: { id: true, name: true, email: true },
    });

    console.log("User email updated successfully:", updatedUser);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Error changing user email:', error);
    res.status(500).json({ error: 'An error occurred while changing the user email', details: error.message });
  }
};

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        homes: true,
        items: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Could not fetch users' });
  }
};
