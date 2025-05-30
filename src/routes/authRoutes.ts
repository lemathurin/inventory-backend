import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/userController";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

// Logout a user
router.post("/logout", logoutUser);

// Refresh token
// router.post("/token", )

export default router;
