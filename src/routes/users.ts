import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Create a new user (registration)
router.post('/register', async (req, res) => {
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
    console.error("Registration error:", error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        homes: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check the password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate a token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
    // Get the first home's ID (if any)
    const homeId = user.homes.length > 0 ? user.homes[0].id : null;

    // Send the response with both token and id
    res.status(200).json({ token, id: user.id, homeId });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Get all users (you might want to restrict this in a real application)
router.get('/', async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

export default router;