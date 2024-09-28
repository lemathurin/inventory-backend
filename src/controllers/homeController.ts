import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createHome = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Received request body:', req.body);
    console.log('User ID from token:', req.user?.userId);
    
    const { name } = req.body;
    const userId = req.user?.userId;

    const home = await prisma.home.create({
      data: {
        name,
        users: {
          connect: { id: userId }
        }
      },
      include: {
        users: true
      }
    });

    res.status(201).json({
      message: 'Home created successfully',
      home: {
        id: home.id,
        name: home.name
      }
    });
  } catch (error) {
    console.error('Error creating home:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'An error occurred while creating the home', details: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred while creating the home' });
    }
  }
};

export const getAllHomes = async (req: Request, res: Response) => {
  try {
    const homes = await prisma.home.findMany();
    res.json(homes);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch homes' });
  }
};

export const getHomeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const home = await prisma.home.findUnique({
      where: { id: String(id) },
      include: { users: true, items: true }
    });

    if (home) {
      res.json(home);
    } else {
      res.status(404).json({ error: 'Home not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch home' });
  }
};

export const getUserHomes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userHomes = await prisma.home.findMany({
      where: {
        users: {
          some: {
            id: userId
          }
        }
      },
      include: {
        users: true,
        items: true
      }
    });

    res.json(userHomes);
  } catch (error) {
    console.error('Error fetching user homes:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'An error occurred while fetching user homes', details: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred while fetching user homes' });
    }
  }
};
