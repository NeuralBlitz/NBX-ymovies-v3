import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { MediaItem } from "@/lib/tmdb";

export interface ContentSection {
  id: string;
  title: string;
  type: 'trending' | 'popular' | 'genre' | 'language' | 'runtime' | 'date' | 'recommendations' | 'special';
  mediaType: 'movie' | 'tv' | 'all';
  fetchFunction: () => Promise<(Movie | TVShow | MediaItem)[]>;
  weight: number; // Higher weight = more likely to be shown
  seasonal?: boolean; // True if this is seasonal content
  requiresAuth?: boolean; // True if this requires user to be logged in
}

export interface DynamicSectionConfig {
  maxSections: number;
  refreshIntervalMs: number;
  genreIds: Record<string, number>;
  languageCodes: Record<string, string>;
  keywordIds: Record<string, number>;
  companyIds: Record<string, number>;
  collectionIds: Record<string, number>;
}

export const defaultConfig: DynamicSectionConfig = {
  maxSections: 8,
  refreshIntervalMs: 30 * 60 * 1000, // 30 minutes
  genreIds: {
    action: 28,
    adventure: 12,
    animation: 16,
    comedy: 35,
    crime: 80,
    documentary: 99,
    drama: 18,
    family: 10751,
    fantasy: 14,
    history: 36,
    horror: 27,
    music: 10402,
    mystery: 9648,
    romance: 10749,
    scienceFiction: 878,
    thriller: 53,
    war: 10752,
    western: 37
  },
  languageCodes: {
    korean: 'ko',
    japanese: 'ja',
    hindi: 'hi',
    spanish: 'es',
    french: 'fr',
    german: 'de',
    italian: 'it',
    mandarin: 'zh',
    portuguese: 'pt',
    russian: 'ru'
  },
  keywordIds: {
    christmas: 207317,
    halloween: 161176,
    valentine: 1701,
    superhero: 9715,
    vampire: 3133,
    zombie: 12377,
    time_travel: 4379,
    space: 818,
    robot: 818
  },
  companyIds: {
    marvel: 420,
    disney: 2,
    warner_bros: 6194,
    universal: 33,
    paramount: 4,
    sony: 5,
    netflix: 213,
    hbo: 49,
    amazon: 1024
  },
  collectionIds: {
    mcu: 131295,
    star_wars: 10,
    harry_potter: 1241,
    lord_of_the_rings: 119,
    fast_furious: 9485,
    john_wick: 404609,
    mission_impossible: 87359
  }
};

// Utility functions for date calculations
export const getDateRanges = () => {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  return {
    lastWeek: {
      start: formatDate(oneWeekAgo),
      end: formatDate(today)
    },
    lastMonth: {
      start: formatDate(oneMonthAgo),
      end: formatDate(today)
    },
    lastThreeMonths: {
      start: formatDate(threeMonthsAgo),
      end: formatDate(today)
    }
  };
};

// Utility function to check if it's a specific season
export const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 12 || month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'fall';
};

// Utility function to check for holidays
export const getCurrentHolidays = () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  const holidays = [];
  
  // Christmas season (November-January)
  if (month === 11 || month === 12 || month === 1) {
    holidays.push('christmas');
  }
  
  // Halloween season (October)
  if (month === 10) {
    holidays.push('halloween');
  }
  
  // Valentine's season (February)
  if (month === 2) {
    holidays.push('valentine');
  }
  
  // Summer movies (June-August)
  if (month >= 6 && month <= 8) {
    holidays.push('summer');
  }
  
  return holidays;
};

// Utility function to get random elements from array
export const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Utility function to weighted random selection
export const weightedRandomSelection = <T extends { weight: number }>(
  items: T[], 
  count: number
): T[] => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const selected: T[] = [];
  const available = [...items];
  
  for (let i = 0; i < count && available.length > 0; i++) {
    let random = Math.random() * totalWeight;
    
    for (let j = 0; j < available.length; j++) {
      random -= available[j].weight;
      if (random <= 0) {
        selected.push(available[j]);
        available.splice(j, 1);
        break;
      }
    }
  }
  
  return selected;
};
