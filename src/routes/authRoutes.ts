import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/userController";
import { sanitizeBody } from "@/middleware/sanitizeBody";

const router = express.Router();

// Register a new user
router.post("/register", sanitizeBody, registerUser);

// Login a user
router.post("/login", sanitizeBody, loginUser);

// Logout a user
router.post("/logout", logoutUser);

// Refresh token
// router.post("/token", )

export default router;
