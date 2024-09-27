import express from 'express';
import { registerUser, loginUser, getAllUsers, changeUserName, changeUserEmail, changeUserPassword, getCurrentUser } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login a user
router.post('/login', loginUser);

// Get all users
router.get('/', getAllUsers);

// Change user name
router.put('/change-name', authenticateToken, changeUserName);

// Change user email
router.put('/change-email', authenticateToken, changeUserEmail);

// Change user password
router.put('/change-password', authenticateToken, changeUserPassword);

// Get current user data
router.get('/me', authenticateToken, getCurrentUser);

export default router;
