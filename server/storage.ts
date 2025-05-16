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
  
  // Watchlist
  getWatchlistItems(userId: string): Promise<WatchlistItem[]>;
  addToWatchlist(item: WatchlistItemInsert): Promise<WatchlistItem>;
  removeFromWatchlist(userId: string, movieId: number): Promise<void>;
  isInWatchlist(userId: string, movieId: number): Promise<boolean>;
  
  // Watch history
  getWatchHistory(userId: string): Promise<WatchHistory[]>;
  updateWatchProgress(item: WatchHistoryInsert): Promise<WatchHistory>;
  getRecentlyWatched(userId: string, limit?: number): Promise<WatchHistory[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
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

  // Watchlist
  async getWatchlistItems(userId: string): Promise<WatchlistItem[]> {
    return db
      .select()
      .from(watchlistItems)
      .where(eq(watchlistItems.userId, userId))
      .orderBy(desc(watchlistItems.addedAt));
  }

  async addToWatchlist(item: WatchlistItemInsert): Promise<WatchlistItem> {
    // Check if already exists
    const [existing] = await db
      .select()
      .from(watchlistItems)
      .where(and(
        eq(watchlistItems.userId, item.userId),
        eq(watchlistItems.movieId, item.movieId)
      ));
      
    if (existing) {
      return existing;
    }
    
    const [newItem] = await db
      .insert(watchlistItems)
      .values(item)
      .returning();
      
    return newItem;
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

  async updateWatchProgress(item: WatchHistoryInsert): Promise<WatchHistory> {
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
      }
      
      // Update lastStoppedAt if provided
      if (item.lastStoppedAt !== undefined) {
        updatedData.lastStoppedAt = item.lastStoppedAt;
      }
      
      // If it's a new session (more than 6 hours since last update), increment watch count
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      if (existing.updatedAt && new Date(existing.updatedAt) < sixHoursAgo) {
        updatedData.watchCount = (existing.watchCount || 1) + 1;
      }
      
      // Update watch duration if provided
      if (item.watchDuration) {
        updatedData.watchDuration = (existing.watchDuration || 0) + item.watchDuration;
      }
      
      // Update rating if provided
      if (item.rating) {
        updatedData.rating = item.rating;
      }
      
      const [updated] = await db
        .update(watchHistory)
        .set(updatedData)
        .where(eq(watchHistory.id, existing.id))
        .returning();
        
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
        
      return newItem;
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
  
  async saveRating(userId: string, movieId: number, rating: number): Promise<WatchHistory> {
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
        
      return newItem;
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
}

export const storage = new DatabaseStorage();
