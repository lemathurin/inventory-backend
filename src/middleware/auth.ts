import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  console.log("Authenticating token...");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.log("No token found");
    return res.sendStatus(401);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: jwt.VerifyErrors | null, user: any) => {
      if (err) {
        console.log("Token verification failed:", err.message);
        return res.sendStatus(403);
      }

      console.log("Token verified, user:", user);
      req.user = { userId: String(user.userId) };
      next();
    },
  );
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};
