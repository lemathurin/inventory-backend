import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  console.log('Authenticating token...');

  // Get cookies from headers manually
  const cookieHeader = req.headers.cookie;
  console.log("Request Headers:", req.headers);

  if (!cookieHeader) {
    console.log('No cookie header found');
    return res.sendStatus(401);
  }

  // Extract token manually
  const cookies: Record<string, string> = Object.fromEntries(
    cookieHeader.split('; ').map(c => c.split('='))
  );

  console.log("Parsed Cookies:", cookies);

  const token = cookies.token;
  
  if (!token) {
    console.log('No token found in cookies');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403);
    }

    if (!user || typeof user !== 'object' || !('userId' in user)) {
      return res.sendStatus(403);
    }

    console.log('Token verified, user:', user);
    req.user = { userId: user.userId };
    next();
  });
}


export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
};

// console.log('JWT_SECRET:', process.env.JWT_SECRET);
