import express from 'express';
import { registerUser, loginUser, getAllUsers } from '../controllers/userController';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login a user
router.post('/login', loginUser);

// Get all users
router.get('/', getAllUsers);

export default router;
