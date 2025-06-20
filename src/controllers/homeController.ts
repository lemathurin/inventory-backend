import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import * as homeModel from "../models/homeModel";
import { validateInviteCode } from "@/utils/inviteCodes";

export const createHome = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("Received request body:", req.body);
    console.log("User ID from token:", req.user?.userId);

    const { name, address } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const home = await homeModel.createNewHome(name, address, userId);

    res.status(201).json({
      message: "Home created successfully",
      home: {
        id: home.id,
        name: home.name,
      },
    });
  } catch (error) {
    console.error("Error creating home:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while creating the home",
        details: error.message,
      });
    } else {
      res
        .status(500)
        .json({ error: "An unknown error occurred while creating the home" });
    }
  }
};

export const getAllHomes = async (req: Request, res: Response) => {
  try {
    const homes = await homeModel.findAllHomes();
    res.json(homes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch homes" });
  }
};

export const getHomeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeId } = req.params;
    const userId = req.user?.userId;

    console.log("Fetching home with ID:", homeId);
    const home = await homeModel.findHomeById(homeId, userId);

    if (home) {
      res.json(home);
    } else {
      res.status(404).json({ error: "Home not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch home" });
  }
};

export const getUserHomes = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userHomes = await homeModel.findHomesByUserId(userId);

    res.json(userHomes);
  } catch (error) {
    console.error("Error fetching user homes:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while fetching user homes",
        details: error.message,
      });
    } else {
      res
        .status(500)
        .json({ error: "An unknown error occurred while fetching user homes" });
    }
  }
};

export const getRoomsByHomeId = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { homeId } = req.params;
    const rooms = await homeModel.findRoomsByHomeId(homeId);

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while fetching rooms",
        details: error.message,
      });
    } else {
      res
        .status(500)
        .json({ error: "An unknown error occurred while fetching rooms" });
    }
  }
};

export const updateHome = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeId } = req.params;
    const { name, address } = req.body;

    if (!name && !address) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updatedHome = await homeModel.updateHomeById(homeId, {
      name,
      address,
    });

    res.status(200).json({
      message: "Home updated successfully",
      home: updatedHome,
    });
  } catch (error) {
    console.error("Error updating home:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while updating the home",
        details: error.message,
      });
    } else {
      res
        .status(500)
        .json({ error: "An unknown error occurred while updating the home" });
    }
  }
};

export const deleteHome = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeId } = req.params;
    const home = await homeModel.findHomeById(homeId);

    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }

    // NOTE: Temporary - if a home has items, it cannot be deleted
    if (home.items && home.items.length > 0) {
      return res.status(400).json({ error: "Cannot delete home with items" });
    }

    await homeModel.deleteHomeById(homeId);
    res.status(200).json({ message: "Home deleted successfully" });
  } catch (error) {
    console.error("Error deleting home", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while deleting the home",
        details: error.message,
      });
    } else {
      res
        .status(500)
        .json({ error: "An unknown error occurred while deleting the home" });
    }
  }
};

export const createHomeInvite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { homeId } = req.params;
    const { expiresInHours } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Calculate expiration (if provided)
    const expiresAt = expiresInHours
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      : undefined;

    const invite = await homeModel.createHomeInvite(homeId, userId, expiresAt);

    res.status(201).json({
      message: "Invite created successfully",
      invite: {
        code: invite.code,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    res.status(500).json({
      error: "Failed to create invite",
      details: (error as Error).message,
    });
  }
};

export const getHomeInvites = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { homeId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Verify user has access to the home
    const home = await homeModel.findHomeById(homeId);
    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }

    const invites = await homeModel.findHomeInvites(homeId);

    res.status(200).json(invites);
  } catch (error) {
    console.error("Error fetching invites:", error);
    res.status(500).json({
      error: "Failed to fetch invites",
      details: (error as Error).message,
    });
  }
};

export const deleteHomeInvite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    await homeModel.deleteHomeInvite(inviteId);
    res.status(200).json({ message: "Invite deleted successfully" });
  } catch (error) {
    console.error("Error deleting invite:", error);
    res.status(500).json({
      error: "Failed to delete invite",
      details: (error as Error).message,
    });
  }
};

export const acceptHomeInvite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { code } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Validate the invite code format
    if (!validateInviteCode(code)) {
      return res.status(400).json({ error: "Invalid invite code format" });
    }

    // Find the invite
    const invite = await homeModel.findInviteByCode(code);
    if (!invite) {
      return res.status(404).json({ error: "Invite not found or expired" });
    }

    // Check if the invite is expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ error: "Invite has expired" });
    }

    // Check if the user is already a member of the home
    const existingMembership = await homeModel.findUserHomeMembership(
      userId,
      invite.homeId
    );

    if (existingMembership) {
      return res
        .status(400)
        .json({ error: "User is already a member of this home" });
    }

    // Add the user to the home (non-admin by default)
    await homeModel.addUserToHome(invite.homeId, userId);

    // Delete the invite (optional, to prevent reuse)
    // await homeModel.deleteHomeInvite(invite.id);

    res.status(200).json({
      message: "Invite accepted successfully",
      home: { id: invite.homeId, name: invite.home.name },
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    res.status(500).json({
      error: "Failed to accept invite",
      details: (error as Error).message,
    });
  }
};

export const getUsersByHomeId = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { homeId } = req.params;
    const users = await homeModel.findUsersByHomeId(homeId);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while fetching users",
        details: error.message,
      });
    } else {
      res
        .status(500)
        .json({ error: "An unknown error occurred while fetching users" });
    }
  }
};

export const removeUserFromHome = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { homeId, userId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if the current user is an admin of the home
    const currentUserMembership = await homeModel.findUserHomeMembership(
      currentUserId,
      homeId
    );

    if (!currentUserMembership || !currentUserMembership.admin) {
      return res
        .status(403)
        .json({ error: "Only home admins can remove users" });
    }

    // Remove the user from the home
    await homeModel.removeUserFromHome(homeId, userId);

    res.status(200).json({ message: "User removed from home successfully" });
  } catch (error) {
    console.error("Error removing user from home:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "An error occurred while removing the user",
        details: error.message,
      });
    } else {
      res
        .status(500)
        .json({ error: "An unknown error occurred while removing the user" });
    }
  }
};

export const getHomePermissions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { homeId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const membership = await homeModel.findUserHomeMembership(userId, homeId);

    if (!membership) {
      return res
        .status(404)
        .json({ error: "User is not a member of this home" });
    }

    res.json({ admin: membership.admin });
  } catch (error) {
    console.error("Error fetching home permissions:", error);
    res.status(500).json({
      error: "Failed to fetch home permissions",
      details: (error as Error).message,
    });
  }
};
