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
  
  // Completion flag
  completed: z.boolean().optional()
});

// Get user preferences
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as { uid: string };
    const userId = user.uid; // Firebase user ID
    
    console.log(`[API] 📋 Getting preferences for user ${userId}`);
    
    const preferences = await storage.getUserPreferences(userId);
    
    if (!preferences) {
      console.log(`[API] 📭 No preferences found for user ${userId}, returning defaults`);
      return res.json({
        favoriteMovies: [],
        watchlist: [],
        watchHistory: [],
        likedGenres: [],
        dislikedGenres: []
      });
    }
      console.log(`[API] 📊 Returning preferences for user ${userId}:`, {
      favoriteMovies: Array.isArray(preferences.favoriteMovies) ? preferences.favoriteMovies.length : 0,
      watchlist: Array.isArray(preferences.watchlist) ? preferences.watchlist.length : 0,
      watchHistory: Array.isArray(preferences.watchHistory) ? preferences.watchHistory.length : 0,
    });
    
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
      console.log(`[API] 💾 Updating preferences for user ${userId}:`, {
      favoriteMovies: Array.isArray(req.body.favoriteMovies) ? req.body.favoriteMovies.length : 0,
      watchlist: Array.isArray(req.body.watchlist) ? req.body.watchlist.length : 0,
      watchHistory: Array.isArray(req.body.watchHistory) ? req.body.watchHistory.length : 0,
    });
    
    // Validate preferences data
    const validatedData = preferencesSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      console.error(`[API] ❌ Validation failed for user ${userId}:`, validatedData.error);
      return res.status(400).json({ error: "Invalid preferences data", details: validatedData.error });
    }
    
    // Update preferences in database
    const updateSuccess = await storage.updateUserPreferences(userId, req.body);
    
    if (!updateSuccess) {
      console.error(`[API] ❌ Failed to update preferences in database for user ${userId}`);
      return res.status(500).json({ error: "Failed to update user preferences" });
    }
    
    console.log(`[API] ✅ Successfully updated preferences for user ${userId}`);
    return res.json({ success: true });
  } catch (error) {
    console.error(`[API] ❌ Error updating user preferences for user ${(req.user as { uid: string })?.uid}:`, error);
    res.status(500).json({ error: "Failed to update user preferences" });
  }
});

export default router;
