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

export default router;