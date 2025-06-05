import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import * as userModel from "../models/userModel";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const user = await userModel.createUser(email, password, name);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({ token, id: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const validPassword = await userModel.verifyPassword(
      password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
    const homeId = user.homes.length > 0 ? user.homes[0].homeId : null;
    const hasHome = user.homes.length > 0;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token, id: user.id, homeId, hasHome });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid credentials" });
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.user as { userId: string };

    const user = await userModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching current user:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching user data",
        details: error.message,
      });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const changeUserName = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.user as { userId: string };
    const { name } = req.body;

    console.log("Received request to change name:", { userId, name });

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Invalid name provided" });
    }

    const updatedUser = await userModel.updateUserName(userId, name);

    console.log("User updated successfully:", updatedUser);
    res.status(200).json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error changing user name:", error);
      res.status(500).json({
        error: "An error occurred while changing the user name",
        details: error.message,
      });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const changeUserEmail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.user as { userId: string };
    const { email } = req.body;

    console.log("Received request to change email:", { userId, email });

    if (!email || typeof email !== "string" || !userModel.isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email provided" });
    }

    // Check if the new email is already in use
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const updatedUser = await userModel.updateUserEmail(userId, email);

    console.log("User email updated successfully:", updatedUser);
    res.status(200).json(updatedUser);
  } catch (error: unknown) {
    console.error("Error changing user email:", error);

    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while changing the user email",
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: "An error occurred while changing the user email",
        details: "Unknown error",
      });
    }
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getAllUsersWithDetails();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Could not fetch users" });
  }
};

export const changeUserPassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.user as { userId: string };
    const { currentPassword, newPassword } = req.body;

    console.log("Received request to change password:", { userId });

    if (
      !currentPassword ||
      !newPassword ||
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({ error: "Invalid password provided" });
    }

    // Fetch the user with their current password
    const user = await userModel.findUserByEmail(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the current password
    const isPasswordValid = await userModel.verifyPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update the user's password
    await userModel.updateUserPassword(userId, newPassword);

    console.log("User password updated successfully");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: unknown) {
    console.error("Error changing user password:", error);

    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while changing the user password",
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: "An error occurred while changing the user password",
        details: "Unknown error",
      });
    }
  }
};

export const deleteUserAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.user as { userId: string };
    const { password } = req.body;

    console.log("Received request to delete account:", { userId });

    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid password provided" });
    }

    // Fetch the user
    const user = await userModel.findUserByEmail(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const isPasswordValid = await userModel.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    await userModel.deleteUser(userId);

    console.log("User account and associated data deleted successfully");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting user account:", error);

    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while deleting the user account",
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: "An error occurred while deleting the user account",
        details: "Unknown error",
      });
    }
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "An error occurred during logout" });
  }
};
