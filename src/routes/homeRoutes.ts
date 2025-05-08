import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createHome,
  getAllHomes,
  getHomeById,
  getUserHomes,
} from "../controllers/homeController";

const router = express.Router();

// Create a new home
router.post("/create-home", authenticateToken, createHome);

// Get all homes for the authenticated user
router.get("/user-homes", authenticateToken, getUserHomes);

// Get all homes
router.get("/", getAllHomes);

// Get a specific home by ID
router.get("/:id", authenticateToken, getHomeById);

export default router;
