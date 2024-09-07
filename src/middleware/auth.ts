import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestWithUser } from '../types/express';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  console.log('Authenticating token...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('No token found');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403);
    }

    console.log('Token verified, user:', user);
    (req as AuthenticatedRequest).user = { userId: String(user.userId) };
    next();
  });
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
};

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}