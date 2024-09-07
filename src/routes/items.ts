import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all items for the user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { ownerId: req.user!.userId }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch items' });
  }
});

// Get all items for a specific home
router.get('/:homeId/items', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const homeId = String(req.params.homeId);
    console.log('Fetching items for homeId:', homeId);
    const items = await prisma.item.findMany({
      where: {
        homeId: homeId,
        ownerId: req.user!.userId,
      }
    });
    console.log('Items found:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Could not fetch items' });
  }
});

// Create a new item
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description } = req.body;
    const item = await prisma.item.create({
      data: {
        name,
        description,
        owner: { connect: { id: req.user!.userId } },
        inventory: { connect: { id: 1 } } // You might want to change this to allow multiple inventories
      },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Could not create item' });
  }
});

// Create a new item for a specific home
router.post('/:homeId/items', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description } = req.body;
    const homeId = String(req.params.homeId);  // Change to String to match UUID
    
    console.log('Creating item:', { name, description, homeId, userId: req.user!.userId });  // Add this log

    const item = await prisma.item.create({
      data: {
        name,
        description,
        ownerId: req.user!.userId,
        homeId: homeId
      },
    });

    console.log('Item created:', item);  // Add this log

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);  // Improve error logging
    res.status(500).json({ error: 'Could not create item', details: (error as Error).message });
  }
});

export default router;