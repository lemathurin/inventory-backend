import { Request } from "express";

export interface RequestWithUser extends Request {
  user?: {
    userId: number;
    // Add any other user properties you need
  };
}
