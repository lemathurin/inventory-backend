import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

// Define the entity types and their corresponding Prisma models
const ENTITY_CONFIG = {
  home: {
    model: "userHome",
    foreignKey: "homeId",
  },
  room: {
    model: "userRoom",
    foreignKey: "roomId",
  },
  item: {
    model: "userItem",
    foreignKey: "itemId",
  },
} as const;

type EntityType = keyof typeof ENTITY_CONFIG;

export const inferAdminMiddleware = (paramKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract entity type from parameter key (e.g., 'roomId' → 'room')
      const entityType = paramKey.replace("Id", "") as EntityType;

      if (!ENTITY_CONFIG[entityType]) {
        return res
          .status(400)
          .json({ error: `Unknown entity type: ${entityType}` });
      }

      const resourceId = req.params[paramKey];
      const userId = (req as any).user?.userId;

      // Check if user is authenticated
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Check if resource ID exists
      if (!resourceId) {
        return res.status(400).json({ error: `Missing ${paramKey} parameter` });
      }

      const config = ENTITY_CONFIG[entityType];

      // Build the where clause dynamically
      const whereClause = {
        [config.foreignKey]: resourceId,
        userId,
        admin: true,
      };

      // Query the appropriate model
      const adminRecord = await (prisma as any)[config.model].findFirst({
        where: whereClause,
      });

      if (!adminRecord) {
        return res.status(403).json({
          error: `Admin access required for this ${entityType}`,
        });
      }

      next();
    } catch (error) {
      console.error(`Error checking admin access:`, error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};

// Export specific middleware functions using inferAdminMiddleware
export const requireHomeAdmin = inferAdminMiddleware("homeId");
export const requireRoomAdmin = inferAdminMiddleware("roomId");
export const requireItemAdmin = inferAdminMiddleware("itemId");
