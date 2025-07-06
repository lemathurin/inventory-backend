import express from "express";
import {
  changeUserName,
  changeUserEmail,
  changeUserPassword,
  getCurrentUser,
  deleteUserAccount,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";
import { sanitizeBody } from "../middleware/sanitizeBody";

const router = express.Router();

// Get current user data
router.get("/me", authenticateToken, getCurrentUser);

// Change user name
router.patch("/me/name", authenticateToken, sanitizeBody, changeUserName);

// Change user email
router.patch("/me/email", authenticateToken, sanitizeBody, changeUserEmail);

// Change user password
router.patch("/me/password", authenticateToken, changeUserPassword);

// Delete account
router.delete("/me", authenticateToken, deleteUserAccount);

export default router;
