import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { RequestWithUser } from '../types/express'; // Make sure this import exists

const router = express.Router();
const prisma = new PrismaClient();

// Create a new home
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('User ID from token:', req.user.userId);
    const { name } = req.body;
    const userId = req.user.userId;
    
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
        // Add any other properties you want to return
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
});

// Get all homes
router.get('/', async (req, res) => {
  try {
    const homes = await prisma.home.findMany();
    res.json(homes);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch homes' });
  }
});

// Get a specific home
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const home = await prisma.home.findUnique({
      where: { id: Number(id) },
      include: { users: true, inventories: true }
    });
    if (home) {
      res.json(home);
    } else {
      res.status(404).json({ error: 'Home not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch home' });
  }
});

// Update a home
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedHome = await prisma.home.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json(updatedHome);
  } catch (error) {
    res.status(500).json({ error: 'Could not update home' });
  }
});

// Delete a home
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.home.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Home deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Could not delete home' });
  }
});

export default router;