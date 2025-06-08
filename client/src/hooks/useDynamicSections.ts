import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  ContentSection, 
  DynamicSectionConfig, 
  defaultConfig,
  getDateRanges,
  getCurrentHolidays,
  weightedRandomSelection,
  getRandomElements
} from '@/lib/dynamicSections';
import {
  getTrendingAll,
  getTrendingMovies,
  getTrendingTVShows,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getNowPlayingMovies,
  getUpcomingMovies,
  getTVShowsAiringToday,
  getTVShowsOnTheAir,
  getMoviesByGenre,
  getTVShowsByGenre,
  getContentByLanguage,
  getMoviesByRuntime,
  getMoviesByDateRange,
  getCriticallyAcclaimed,
  getHiddenGems,
  getContentByKeywords,
  getContentByCompany,
  getMovieRecommendations,
  getTVShowRecommendations,
  getSimilarMovies,
  getSimilarTVShows
} from '@/lib/tmdb';

export const useDynamicSections = (config: DynamicSectionConfig = defaultConfig) => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  
  const { isAuthenticated } = useAuth();
  const { preferences } = useUserPreferences();
  
  // Generate all possible sections
  const generateAllSections = useCallback((): ContentSection[] => {
    const dateRanges = getDateRanges();
    const holidays = getCurrentHolidays();
    const allSections: ContentSection[] = [];
    
    // Trending sections
    allSections.push(
      {
        id: 'trending-all-day',
        title: 'Trending Today',
        type: 'trending',
        mediaType: 'all',
        fetchFunction: () => getTrendingAll('day'),
        weight: 10
      },
      {
        id: 'trending-all-week',
        title: 'Trending This Week',
        type: 'trending',
        mediaType: 'all',
        fetchFunction: () => getTrendingAll('week'),
        weight: 8
      },
      {
        id: 'trending-movies',
        title: 'Trending Movies',
        type: 'trending',
        mediaType: 'movie',
        fetchFunction: () => getTrendingMovies('week'),
        weight: 7
      },
      {
        id: 'trending-tv',
        title: 'Trending TV Shows',
        type: 'trending',
        mediaType: 'tv',
        fetchFunction: () => getTrendingTVShows('week'),
        weight: 7
      }
    );
    
    // Popular & Top-Rated sections
    allSections.push(
      {
        id: 'popular-movies',
        title: 'Popular Movies',
        type: 'popular',
        mediaType: 'movie',
        fetchFunction: () => getPopularMovies(),
        weight: 8
      },
      {
        id: 'popular-tv',
        title: 'Popular TV Shows',
        type: 'popular',
        mediaType: 'tv',
        fetchFunction: () => getPopularTVShows(),
        weight: 8
      },
      {
        id: 'top-rated-movies',
        title: 'Top Rated Movies',
        type: 'popular',
        mediaType: 'movie',
        fetchFunction: () => getTopRatedMovies(),
        weight: 6
      },
      {
        id: 'top-rated-tv',
        title: 'Top Rated TV Shows',
        type: 'popular',
        mediaType: 'tv',
        fetchFunction: () => getTopRatedTVShows(),
        weight: 6
      }
    );
    
    // Now Playing & Upcoming sections
    allSections.push(
      {
        id: 'now-playing',
        title: 'Now in Cinemas',
        type: 'special',
        mediaType: 'movie',
        fetchFunction: () => getNowPlayingMovies(),
        weight: 7
      },
      {
        id: 'upcoming',
        title: 'Coming Soon',
        type: 'special',
        mediaType: 'movie',
        fetchFunction: () => getUpcomingMovies(),
        weight: 5
      },
      {
        id: 'airing-today',
        title: 'New Episodes Today',
        type: 'special',
        mediaType: 'tv',
        fetchFunction: () => getTVShowsAiringToday(),
        weight: 6
      },
      {
        id: 'on-the-air',
        title: 'Currently Airing',
        type: 'special',
        mediaType: 'tv',
        fetchFunction: () => getTVShowsOnTheAir(),
        weight: 5
      }
    );
    
    // Genre-based sections (random selection)
    const genreEntries = Object.entries(config.genreIds);
    const selectedGenres = getRandomElements(genreEntries, 4);
    
    selectedGenres.forEach(([genreName, genreId]) => {
      const capitalizedName = genreName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      allSections.push(
        {
          id: `genre-movies-${genreName}`,
          title: `${capitalizedName} Movies`,
          type: 'genre',
          mediaType: 'movie',
          fetchFunction: () => getMoviesByGenre(genreId),
          weight: 5
        },
        {
          id: `genre-tv-${genreName}`,
          title: `${capitalizedName} Shows`,
          type: 'genre',
          mediaType: 'tv',
          fetchFunction: () => getTVShowsByGenre(genreId),
          weight: 5
        }
      );
    });
    
    // Language & Region sections
    const languageEntries = Object.entries(config.languageCodes);
    const selectedLanguages = getRandomElements(languageEntries, 3);
    
    selectedLanguages.forEach(([languageName, languageCode]) => {
      const capitalizedName = languageName.charAt(0).toUpperCase() + languageName.slice(1);
      
      allSections.push(
        {
          id: `language-movies-${languageName}`,
          title: `${capitalizedName} Movies`,
          type: 'language',
          mediaType: 'movie',
          fetchFunction: () => getContentByLanguage('movie', languageCode),
          weight: 4
        },
        {
          id: `language-tv-${languageName}`,
          title: `${capitalizedName} TV Shows`,
          type: 'language',
          mediaType: 'tv',
          fetchFunction: () => getContentByLanguage('tv', languageCode),
          weight: 4
        }
      );
    });
    
    // Special anime section
    allSections.push({
      id: 'anime',
      title: 'Anime',
      type: 'language',
      mediaType: 'movie',
      fetchFunction: () => getContentByLanguage('movie', 'ja', config.genreIds.animation),
      weight: 6
    });
    
    // Runtime & Release-Date sections
    allSections.push(
      {
        id: 'short-movies',
        title: 'Quick Watch (Under 90 min)',
        type: 'runtime',
        mediaType: 'movie',
        fetchFunction: () => getMoviesByRuntime(90),
        weight: 4
      },
      {
        id: 'new-this-week',
        title: 'New This Week',
        type: 'date',
        mediaType: 'movie',
        fetchFunction: () => getMoviesByDateRange(dateRanges.lastWeek.start, dateRanges.lastWeek.end),
        weight: 6
      },
      {
        id: 'new-this-month',
        title: 'New This Month',
        type: 'date',
        mediaType: 'movie',
        fetchFunction: () => getMoviesByDateRange(dateRanges.lastMonth.start, dateRanges.lastMonth.end),
        weight: 5
      }
    );
    
    // Holiday-themed sections
    holidays.forEach(holiday => {
      const keywordId = config.keywordIds[holiday];
      if (keywordId) {
        allSections.push({
          id: `holiday-${holiday}`,
          title: getHolidayTitle(holiday),
          type: 'special',
          mediaType: 'movie',
          fetchFunction: () => getContentByKeywords('movie', [keywordId]),
          weight: 8,
          seasonal: true
        });
      }
    });
    
    // Special discovery sections
    allSections.push(
      {
        id: 'critically-acclaimed-movies',
        title: 'Critically Acclaimed Movies',
        type: 'special',
        mediaType: 'movie',
        fetchFunction: () => getCriticallyAcclaimed('movie'),
        weight: 5
      },
      {
        id: 'critically-acclaimed-tv',
        title: 'Critically Acclaimed TV Shows',
        type: 'special',
        mediaType: 'tv',
        fetchFunction: () => getCriticallyAcclaimed('tv'),
        weight: 5
      },
      {
        id: 'hidden-gems-movies',
        title: 'Hidden Gem Movies',
        type: 'special',
        mediaType: 'movie',
        fetchFunction: () => getHiddenGems('movie'),
        weight: 4
      },
      {
        id: 'hidden-gems-tv',
        title: 'Hidden Gem TV Shows',
        type: 'special',
        mediaType: 'tv',
        fetchFunction: () => getHiddenGems('tv'),
        weight: 4
      }
    );
      // Recommendation sections (only for authenticated users)
    if (isAuthenticated && preferences?.favoriteMovies && preferences.favoriteMovies.length > 0) {
      // Filter favorites to get movies and TV shows separately
      const favoriteMovies = preferences.favoriteMovies.filter(item => 
        'title' in item || !('name' in item)
      );
      const favoriteTVShows = preferences.favoriteMovies.filter(item => 
        'name' in item && 'first_air_date' in item
      );
      
      // Process favorite movies
      if (favoriteMovies.length > 0) {
        const selectedMovies = getRandomElements(favoriteMovies, 2);
        selectedMovies.forEach((movie) => {
          const title = (movie as any).title || (movie as any).name || 'Unknown Title';
          allSections.push(
            {
              id: `recommendations-${movie.id}`,
              title: `Because You Liked "${title}"`,
              type: 'recommendations',
              mediaType: 'movie',
              fetchFunction: () => getMovieRecommendations(movie.id),
              weight: 9,
              requiresAuth: true
            },
            {
              id: `similar-${movie.id}`,
              title: `More Like "${title}"`,
              type: 'recommendations',
              mediaType: 'movie',
              fetchFunction: () => getSimilarMovies(movie.id),
              weight: 8,
              requiresAuth: true
            }
          );
        });
      }
      
      // Process favorite TV shows
      if (favoriteTVShows.length > 0) {
        const selectedTVShows = getRandomElements(favoriteTVShows, 2);
        selectedTVShows.forEach((show) => {
          const name = (show as any).name || (show as any).title || 'Unknown Show';
          allSections.push(
            {
              id: `tv-recommendations-${show.id}`,
              title: `Because You Liked "${name}"`,
              type: 'recommendations',
              mediaType: 'tv',
              fetchFunction: () => getTVShowRecommendations(show.id),
              weight: 9,
              requiresAuth: true
            },
            {
              id: `tv-similar-${show.id}`,
              title: `More Like "${name}"`,
              type: 'recommendations',
              mediaType: 'tv',
              fetchFunction: () => getSimilarTVShows(show.id),
              weight: 8,
              requiresAuth: true
            }
          );
        });
      }
    }
    
    return allSections;
  }, [config, isAuthenticated, preferences]);
  
  // Helper function for holiday titles
  const getHolidayTitle = (holiday: string): string => {
    const titles: Record<string, string> = {
      christmas: 'Christmas Favorites',
      halloween: 'Halloween Horror',
      valentine: 'Romantic Movies',
      summer: 'Summer Blockbusters'
    };
    return titles[holiday] || 'Seasonal Picks';
  };
  
  // Generate random sections
  const generateRandomSections = useCallback(() => {
    setIsLoading(true);
    
    try {
      const allSections = generateAllSections();
      
      // Filter out auth-required sections if user is not authenticated
      const availableSections = allSections.filter(section => 
        !section.requiresAuth || isAuthenticated
      );
      
      // Use weighted random selection
      const selectedSections = weightedRandomSelection(availableSections, config.maxSections);
      
      setSections(selectedSections);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error generating random sections:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateAllSections, config.maxSections, isAuthenticated]);
  
  // Initial load and refresh intervals
  useEffect(() => {
    generateRandomSections();
    
    const interval = setInterval(() => {
      generateRandomSections();
    }, config.refreshIntervalMs);
    
    return () => clearInterval(interval);
  }, [generateRandomSections, config.refreshIntervalMs]);
  
  // Refresh when auth state changes
  useEffect(() => {
    if (lastRefresh > 0) { // Don't refresh on initial load
      generateRandomSections();
    }
  }, [isAuthenticated, generateRandomSections]);
  
  return {
    sections,
    isLoading,
    lastRefresh,
    refreshSections: generateRandomSections
  };
};
