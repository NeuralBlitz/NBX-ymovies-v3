import { Request, Response, NextFunction } from 'express';
import admin from './firebaseAdmin';

// Middleware to check if the user is authenticated with Firebase
export const firebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Middleware to check if the user has the admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
  }

  const { admin: isAdmin } = req.user as { admin?: boolean };
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  next();
};
