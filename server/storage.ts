import { 
  users, 
  userPreferences, 
  watchlistItems, 
  watchHistory,
  type User, 
  type UpsertUser,
  type UserPreferences,
  type UserPreferencesInsert,
  type WatchlistItem,
  type WatchlistItemInsert,
  type WatchHistory,
  type WatchHistoryInsert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  saveUserPreferences(preferences: UserPreferencesInsert): Promise<UserPreferences>;
  updateUserPreferences(userId: string, preferences: any): Promise<boolean>;
  
  // Watchlist
  getWatchlistItems(userId: string): Promise<WatchlistItem[]>;
  addToWatchlist(item: WatchlistItemInsert): Promise<WatchlistItem | null>;
  removeFromWatchlist(userId: string, movieId: number): Promise<void>;
  isInWatchlist(userId: string, movieId: number): Promise<boolean>;
  
  // Watch history
  getWatchHistory(userId: string): Promise<WatchHistory[]>;
  updateWatchProgress(item: WatchHistoryInsert): Promise<WatchHistory | null>;
  getRecentlyWatched(userId: string, limit?: number): Promise<WatchHistory[]>;
}

export class DatabaseStorage implements IStorage {
  // Flag to track database connection status
  private dbConnectionFailed = false;

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    if (this.dbConnectionFailed) {
      console.log("Using fallback for getUser due to previous DB connection failure");
      return undefined;
    }

    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error in getUser:", error);
      this.dbConnectionFailed = true;
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (this.dbConnectionFailed) {
      console.log("Using fallback for upsertUser due to previous DB connection failure");
      return {
        id: userData.id,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error("Error in upsertUser:", error);
      this.dbConnectionFailed = true;
      return {
        id: userData.id,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    if (this.dbConnectionFailed) {
      console.log("Using fallback for getUserPreferences due to previous DB connection failure");
      return {
        id: 0,
        userId: userId,
        favoriteMovies: [],
        watchlist: [],
        watchHistory: [],
        likedGenres: [],
        dislikedGenres: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    try {
      const [preferences] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
      return preferences;
    } catch (error) {
      console.error("Error in getUserPreferences:", error);
      this.dbConnectionFailed = true;
      return {
        id: 0,
        userId: userId,
        favoriteMovies: [],
        watchlist: [],
        watchHistory: [],
        likedGenres: [],
        dislikedGenres: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async saveUserPreferences(preferences: UserPreferencesInsert): Promise<UserPreferences> {
    // Delete existing preferences if any
    await db
      .delete(userPreferences)
      .where(eq(userPreferences.userId, preferences.userId));
    
    // Insert new preferences
    const [newPreferences] = await db
      .insert(userPreferences)
      .values({
        ...preferences,
        updatedAt: new Date(),
      })
      .returning();
    
    return newPreferences;
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      console.log(`[Preferences] Updating preferences for user ${userId}`);
      
      // Ensure user exists in database before creating preferences
      const userExists = await this.ensureUserExists(userId);
      
      if (!userExists) {
        console.error(`[Preferences] ❌ Failed to ensure user exists: ${userId}`);
        return false;
      }
      
      // Check if preferences already exist
      const existingPrefs = await this.getUserPreferences(userId);
      
      if (existingPrefs) {
        // Update existing preferences
        await db
          .update(userPreferences)
          .set({
            ...preferences,
            updatedAt: new Date()
          })
          .where(eq(userPreferences.userId, userId));
        console.log(`[Preferences] ✅ Updated existing preferences for user ${userId}`);
      } else {
        // Create new preferences
        await db
          .insert(userPreferences)
          .values({
            userId,
            ...preferences,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        console.log(`[Preferences] ✅ Created new preferences for user ${userId}`);
      }
      
      return true;
    } catch (error) {
      console.error(`[Preferences] ❌ Failed to update preferences for user ${userId}:`, error);
      return false;
    }
  }

  // Watchlist
  async getWatchlistItems(userId: string): Promise<WatchlistItem[]> {
    return db
      .select()
      .from(watchlistItems)
      .where(eq(watchlistItems.userId, userId))
      .orderBy(desc(watchlistItems.addedAt));
  }

  async addToWatchlist(item: WatchlistItemInsert): Promise<WatchlistItem | null> {
    try {
      console.log(`[Watchlist] Adding movie ${item.movieId} to watchlist for user ${item.userId}`);
      
      // Ensure user exists in database before adding to watchlist
      const userExists = await this.ensureUserExists(item.userId);
      
      if (!userExists) {
        console.error(`[Watchlist] ❌ Failed to ensure user exists: ${item.userId}`);
        throw new Error(`User ${item.userId} does not exist and could not be created`);
      }
      
      // Check if already exists
      const [existing] = await db
        .select()
        .from(watchlistItems)
        .where(and(
          eq(watchlistItems.userId, item.userId),
          eq(watchlistItems.movieId, item.movieId)
        ));
        
      if (existing) {
        console.log(`[Watchlist] ℹ️ Movie ${item.movieId} already in watchlist for user ${item.userId}`);
        return existing;
      }
      
      const [newItem] = await db
        .insert(watchlistItems)
        .values(item)
        .returning();
        
      console.log(`[Watchlist] ✅ Added movie ${item.movieId} to watchlist for user ${item.userId}`);
      return newItem;
    } catch (error) {
      console.error(`[Watchlist] ❌ Failed to add movie ${item.movieId} to watchlist for user ${item.userId}:`, error);
      return null;
    }
  }

  async removeFromWatchlist(userId: string, movieId: number): Promise<void> {
    await db
      .delete(watchlistItems)
      .where(and(
        eq(watchlistItems.userId, userId),
        eq(watchlistItems.movieId, movieId)
      ));
  }

  async isInWatchlist(userId: string, movieId: number): Promise<boolean> {
    const [item] = await db
      .select()
      .from(watchlistItems)
      .where(and(
        eq(watchlistItems.userId, userId),
        eq(watchlistItems.movieId, movieId)
      ));
      
    return !!item;
  }

  // Watch history with enhanced tracking
  async getWatchHistory(userId: string): Promise<WatchHistory[]> {
    return db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchedAt));
  }

  async updateWatchProgress(item: WatchHistoryInsert): Promise<WatchHistory | null> {
    try {
      console.log(`[WatchHistory] Updating watch progress for movie ${item.movieId}, user ${item.userId}`);
      
      // Ensure user exists in database before creating watch history
      const userExists = await this.ensureUserExists(item.userId);
      
      if (!userExists) {
        console.error(`[WatchHistory] ❌ Failed to ensure user exists: ${item.userId}`);
        return null;
      }
      
      // Check if entry exists
      const [existing] = await db
        .select()
        .from(watchHistory)
        .where(and(
          eq(watchHistory.userId, item.userId),
          eq(watchHistory.movieId, item.movieId)
        ));
        
      if (existing) {
        // Update existing record
        const updatedData: any = {
          watchProgress: item.watchProgress ?? existing.watchProgress,
          updatedAt: new Date(),
        };
        
        // Handle watch completion - mark as completed if progress is >=90%
        if (item.watchProgress && item.watchProgress >= 90 && !existing.completed) {
          updatedData.completed = true;
          console.log(`[WatchHistory] 🎬 Movie ${item.movieId} marked as completed for user ${item.userId}`);
        }
        
        // Update lastStoppedAt if provided
        if (item.lastStoppedAt !== undefined) {
          updatedData.lastStoppedAt = item.lastStoppedAt;
        }
        
        // If it's a new session (more than 6 hours since last update), increment watch count
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        if (existing.updatedAt && new Date(existing.updatedAt) < sixHoursAgo) {
          updatedData.watchCount = (existing.watchCount || 1) + 1;
          console.log(`[WatchHistory] 🔄 New watch session detected for movie ${item.movieId}, user ${item.userId}`);
        }
        
        // Update watch duration if provided
        if (item.watchDuration) {
          updatedData.watchDuration = (existing.watchDuration || 0) + item.watchDuration;
        }
        
        // Update rating if provided
        if (item.rating) {
          updatedData.rating = item.rating;
          console.log(`[WatchHistory] ⭐ Rating updated to ${item.rating} for movie ${item.movieId}, user ${item.userId}`);
        }
        
        const [updated] = await db
          .update(watchHistory)
          .set(updatedData)
          .where(eq(watchHistory.id, existing.id))
          .returning();
          
        console.log(`[WatchHistory] ✅ Updated watch progress for movie ${item.movieId}, user ${item.userId}`);
        return updated;
      } else {
        // Create new record
        const watchData = {
          ...item,
          watchedAt: new Date(),
          updatedAt: new Date(),
          watchCount: 1,
          completed: item.watchProgress ? item.watchProgress >= 90 : false
        };
        
        const [newItem] = await db
          .insert(watchHistory)
          .values(watchData)
          .returning();
          
        console.log(`[WatchHistory] ✅ Created new watch history entry for movie ${item.movieId}, user ${item.userId}`);
        return newItem;
      }
    } catch (error) {
      console.error(`[WatchHistory] ❌ Failed to update watch progress for movie ${item.movieId}, user ${item.userId}:`, error);
      return null;
    }
  }

  async getRecentlyWatched(userId: string, limit: number = 5): Promise<WatchHistory[]> {
    return db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchedAt))
      .limit(limit);
  }
  
  async getWatchHistoryByMovieId(userId: string, movieId: number): Promise<WatchHistory | undefined> {
    const [history] = await db
      .select()
      .from(watchHistory)
      .where(and(
        eq(watchHistory.userId, userId),
        eq(watchHistory.movieId, movieId)
      ));
      
    return history;
  }
  
  async getTopRatedMovies(userId: string, limit: number = 10): Promise<WatchHistory[]> {
    return db
      .select()
      .from(watchHistory)
      .where(and(
        eq(watchHistory.userId, userId),
        sql`${watchHistory.rating} IS NOT NULL`
      ))
      .orderBy(desc(watchHistory.rating))
      .limit(limit);
  }
  
  async getCompletedMovies(userId: string): Promise<WatchHistory[]> {
    return db
      .select()
      .from(watchHistory)
      .where(and(
        eq(watchHistory.userId, userId),
        eq(watchHistory.completed, true)
      ))
      .orderBy(desc(watchHistory.watchedAt));
  }
  
  async saveRating(userId: string, movieId: number, rating: number): Promise<WatchHistory | null> {
    try {
      console.log(`[Ratings] Saving rating ${rating} for movie ${movieId}, user ${userId}`);
      
      // Ensure user exists in database before creating watch history record
      const userExists = await this.ensureUserExists(userId);
      
      if (!userExists) {
        console.error(`[Ratings] ❌ Failed to ensure user exists: ${userId}`);
        return null;
      }
      
      const [existing] = await db
        .select()
        .from(watchHistory)
        .where(and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.movieId, movieId)
        ));
        
      if (existing) {
        // Update existing record with rating
        const [updated] = await db
          .update(watchHistory)
          .set({
            rating,
            updatedAt: new Date()
          })
          .where(eq(watchHistory.id, existing.id))
          .returning();
          
        console.log(`[Ratings] ✅ Updated rating to ${rating} for movie ${movieId}, user ${userId}`);
        return updated;
      } else {
        // Create new record with rating
        const [newItem] = await db
          .insert(watchHistory)
          .values({
            userId,
            movieId,
            rating,
            watchProgress: 0,
            watchedAt: new Date(),
            updatedAt: new Date(),
            watchCount: 0
          })
          .returning();
          
        console.log(`[Ratings] ✅ Created new entry with rating ${rating} for movie ${movieId}, user ${userId}`);
        return newItem;
      }
    } catch (error) {
      console.error(`[Ratings] ❌ Failed to save rating for movie ${movieId}, user ${userId}:`, error);
      return null;
    }
  }
  
  async getMostWatchedMovies(userId: string, limit: number = 10): Promise<WatchHistory[]> {
    return db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchCount))
      .limit(limit);
  }
  
  async getWatchHistoryStats(userId: string): Promise<{
    totalMoviesWatched: number;
    totalWatchTime: number;
    averageRating: number | null;
    completionRate: number;
  }> {
    // Get all user watch history
    const userHistory = await this.getWatchHistory(userId);
    
    // Calculate stats
    const totalMoviesWatched = userHistory.length;
    const totalWatchTime = userHistory.reduce((sum, item) => sum + (item.watchDuration || 0), 0);
    
    // Calculate average rating (ignoring null/undefined ratings)
    const ratings = userHistory.filter(item => item.rating).map(item => item.rating!);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : null;
    
    // Calculate completion rate
    const completedMovies = userHistory.filter(item => item.completed).length;
    const completionRate = totalMoviesWatched > 0 
      ? (completedMovies / totalMoviesWatched * 100) 
      : 0;
    
    return {
      totalMoviesWatched,
      totalWatchTime,
      averageRating,
      completionRate
    };
  }
  
  // Helper method to ensure user exists before creating dependent records
  private async ensureUserExists(userId: string): Promise<boolean> {
    if (this.dbConnectionFailed) {
      console.log(`[Database] ⚠️ Skipping user creation due to DB connection failure (userId: ${userId})`);
      return false;
    }

    try {
      // Check if user already exists
      const existingUser = await this.getUser(userId);
      
      if (!existingUser) {
        // Create a basic user record with minimal data
        await this.upsertUser({
          id: userId,
          email: null, // Will be null unless we get user data from Firebase
          firstName: null,
          lastName: null,
          profileImageUrl: null,
        });
        console.log(`[Database] ✅ Created user record for ID: ${userId}`);
        return true;
      }
      
      // User already exists
      return true;
    } catch (error) {
      console.error(`[Database] ❌ Error ensuring user exists (userId: ${userId}):`, error);
      // Don't throw here to avoid breaking the preferences flow
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
