import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload, TOKEN_CONFIG } from "../config/tokenConfig";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    console.log("No cookie header found");
    return res.status(401).json({ error: "No authentication token" });
  }

  const cookies: Record<string, string> = Object.fromEntries(
    cookieHeader.split("; ").map((c) => c.split("="))
  );

  const token = cookies.token;
  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.log("Token expired");
        return res.status(401).json({
          error: "Access token expired",
          code: "TOKEN_EXPIRED",
        });
      }
      console.log("Token verification failed:", err.message);
      return res.status(403).json({ error: "Invalid access token" });
    }

    if (!user || typeof user !== "object" || !("userId" in user)) {
      return res.status(403).json({ error: "Invalid token payload" });
    }

    const userData = user as TokenPayload;
    const now = Math.floor(Date.now() / 1000);

    const timeUntilExpiration = userData.exp - now;

    if (timeUntilExpiration <= TOKEN_CONFIG.refreshThreshold) {
      console.log("Token expiring soon, refreshing...");

      const newToken = generateToken(userData.userId);

      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: TOKEN_CONFIG.cookieMaxAge,
      });

      res.setHeader("X-Token-Refreshed", "true");

      // console.log(`Token refreshed for user ${userData.userId}`);
    }

    req.user = { userId: userData.userId };
    next();
  });
}

export const generateToken = (userId: string): string => {
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      userId,
      iat: now,
      lastActivity: now,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: TOKEN_CONFIG.duration }
  );
};

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_CONFIG.cookieMaxAge,
  });
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};
