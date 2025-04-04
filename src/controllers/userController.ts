import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
})

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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

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
          select: {
            homeId: true,
            home: {
              select: { id: true }
            }
          },
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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    const homeId = user.homes.length > 0 ? user.homes[0].homeId : null;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token, id: user.id, homeId });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true,
        homes: {
          select: {
            homeId: true,
            home: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        },
        items: {
          select: {
            item: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error fetching current user:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching user data', details: error.message });
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

export const changeUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };
    const { currentPassword, newPassword } = req.body;

    console.log("Received request to change password:", { userId });

    if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Invalid password provided' });
    }

    // Fetch the user with their current password
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
      select: { id: true, name: true, email: true },
    });

    console.log("User password updated successfully");
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error changing user password:', error);
    res.status(500).json({ error: 'An error occurred while changing the user password', details: error.message });
  }
};

export const deleteUserAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };
    const { password } = req.body;

    console.log("Received request to delete account:", { userId });

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid password provided' });
    }

    // Fetch the user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Delete associated records first
    await prisma.$transaction(async (prisma) => {
      // Delete associated items
      await prisma.userItem.deleteMany({ where: { userId } });
      await prisma.item.deleteMany({ where: { users: { some: { userId } } } });

      // Delete associated homes
      await prisma.userHome.deleteMany({ where: { userId } });
      await prisma.home.deleteMany({ where: { users: { some: { userId } } } });

      // Delete the user
      await prisma.user.delete({ where: { id: userId } });
    });

    console.log("User account and associated data deleted successfully");
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: 'An error occurred while deleting the user account', details: error.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
};
