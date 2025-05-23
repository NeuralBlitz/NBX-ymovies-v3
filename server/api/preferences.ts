import { storage } from "../storage";
import { z } from "zod";
import express from "express";
import admin from "../firebaseAdmin";

// Firebase Auth middleware
const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const router = express.Router();

// Schema for user preferences
const preferencesSchema = z.object({
  // Original fields
  favoriteMovies: z.array(z.any()).optional(),
  watchlist: z.array(z.any()).optional(),
  watchHistory: z.array(z.any()).optional(),
  likedGenres: z.array(z.string()).optional(),
  dislikedGenres: z.array(z.string()).optional(),
  
  // Quiz fields
  genres: z.array(z.number()).optional(),
  yearRange: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  contentType: z.enum(['movies', 'tv', 'both']).optional(),
  
  // Quiz completion flag
  completed: z.boolean().optional()
});

// Get user preferences
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as { uid: string };
    const userId = user.uid; // Firebase user ID
    
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences) {
      return res.json({
        favoriteMovies: [],
        watchlist: [],
        watchHistory: [],
        likedGenres: [],
        dislikedGenres: []
      });
    }
    
    return res.json(preferences);
  } catch (error) {
    console.error("Error retrieving user preferences:", error);
    res.status(500).json({ error: "Failed to retrieve user preferences" });
  }
});

// Update user preferences
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as { uid: string };
    const userId = user.uid; // Firebase user ID
    
    // Validate preferences data
    const validatedData = preferencesSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: "Invalid preferences data", details: validatedData.error });
    }
      // Update preferences in database
    const updateSuccess = await storage.updateUserPreferences(userId, req.body);
    
    if (!updateSuccess) {
      return res.status(500).json({ error: "Failed to update user preferences" });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ error: "Failed to update user preferences" });
  }
});

export default router;
