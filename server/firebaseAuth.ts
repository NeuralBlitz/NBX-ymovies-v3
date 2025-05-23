import { Request, Response, NextFunction } from 'express';
import admin from './firebaseAdmin';
import { storage } from './storage';

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
      
      // Automatically create or update user in database when authenticated
      try {
        // Extract user info from Firebase token
        const { uid, email, name = '', picture = null } = decodedToken;
        
        // Try to split name into first and last name
        let firstName = name, lastName = '';
        if (name && name.includes(' ')) {
          const nameParts = name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ');
        }
        
        // Create/update the user in our database
        await storage.upsertUser({
          id: uid,
          email: email || null,
          firstName: firstName || null,
          lastName: lastName || null,
          profileImageUrl: picture || null,
        });
        
        console.log(`User authenticated: ${uid} (${email || 'no email'})`);
      } catch (dbError) {
        // Log error but continue - don't block the request if user creation fails
        console.error(`Failed to create/update user record for ${decodedToken.uid}:`, dbError);
      }
      
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
