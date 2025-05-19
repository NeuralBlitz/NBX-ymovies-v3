import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Movie } from "@/types/movie";

interface RecommendationCategory {
  category: string;
  movies: Movie[];
}

interface PersonalizedRecommendationsData {
  recommendation_categories: RecommendationCategory[];
}

/**
 * Custom hook to fetch personalized movie recommendations 
 * from the recommendation service
 */
export function usePersonalizedRecommendations() {
  const { isAuthenticated, user } = useAuth();
  const { preferences } = useUserPreferences();

  // Get main personalized recommendations
  const personalizedQuery = useQuery<PersonalizedRecommendationsData>({
    queryKey: ["/api/recommendations/personalized", user?.id],
    enabled: isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  // Get quiz-based recommendations for new users
  const quizBasedQuery = useQuery<Movie[]>({
    queryKey: ["/api/recommendations/quiz-based", user?.id],
    enabled: isAuthenticated && !!user?.id && !preferences?.watchHistory?.length,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  // Get trending recommendations as a fallback
  const trendingQuery = useQuery<Movie[]>({
    queryKey: ["/api/recommendations/trending"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Determine what type of recommendations to show based on user state
  const hasPersonalizedRecommendations = 
    personalizedQuery.data?.recommendation_categories?.length > 0;
  
  const hasQuizBasedRecommendations =
    quizBasedQuery.data?.length > 0;
  
  const hasTrendingRecommendations =
    trendingQuery.data?.length > 0;
  
  // Determine loading states
  const isLoading = 
    personalizedQuery.isLoading || 
    (quizBasedQuery.isLoading && !preferences?.watchHistory?.length) ||
    trendingQuery.isLoading;
  
  return {
    personalized: personalizedQuery.data,
    quizBased: quizBasedQuery.data,
    trending: trendingQuery.data,
    hasPersonalizedRecommendations,
    hasQuizBasedRecommendations,
    hasTrendingRecommendations,
    isLoading,
    error: personalizedQuery.error || quizBasedQuery.error || trendingQuery.error
  };
}

export default usePersonalizedRecommendations;
