import { Movie } from "@/types/movie";
import MovieSlider from "./MovieSlider";
import { useAuth } from "@/hooks/useAuth";
import usePersonalizedRecommendations from "@/hooks/usePersonalizedRecommendations";
import { useUserPreferences } from "@/hooks/useUserPreferences";

/**
 * Component to show recommendations based on user's quiz answers
 * This is for new users who haven't built up a viewing history yet
 */
const QuizBasedRecommendations = () => {
  const { isAuthenticated } = useAuth();
  const { preferences } = useUserPreferences();
  const { 
    quizBased, 
    isLoading, 
    hasQuizBasedRecommendations 
  } = usePersonalizedRecommendations();  // Don't show if we don't have quiz-based recommendations
  // The parent component already checks if we should show this or not
  if (!hasQuizBasedRecommendations) {
    return null;
  }
  
  // Also don't show if there's no quiz data
  if (!preferences?.likedGenres || preferences.likedGenres.length === 0) {
    return null;
  }

  return (
    <MovieSlider
      title="Picked for You Based on Your Preferences"
      movies={quizBased || []}
      isLoading={isLoading}
    />
  );
};

export default QuizBasedRecommendations;
