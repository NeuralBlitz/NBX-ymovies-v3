import { createHandler } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";
import express from "express";

const router = express.Router();

// Schema for user preferences
const preferencesSchema = z.object({
  favoriteMovies: z.array(z.any()),
  watchlist: z.array(z.any()),
  watchHistory: z.array(z.any()),
  likedGenres: z.array(z.string()),
  dislikedGenres: z.array(z.string())
});

// Get user preferences
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as { claims: { sub: string } };
    const userId = user.claims.sub;
    
    const preferences = await createHandler().getUserPreferences(userId);
    
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
    const user = req.user as { claims: { sub: string } };
    const userId = user.claims.sub;
    
    // Validate preferences data
    const validatedData = preferencesSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: "Invalid preferences data", details: validatedData.error });
    }
    
    // Update preferences in database
    await createHandler().updateUserPreferences(userId, req.body);
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ error: "Failed to update user preferences" });
  }
});

export default router;
