import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createHome, getAllHomes, getHomeById } from '../controllers/homeController';

const router = express.Router();

// Create a new home
router.post('/', authenticateToken, createHome);

// Get all homes
router.get('/', getAllHomes);

// Get a specific home by ID
router.get('/:id', authenticateToken, getHomeById);

export default router;
