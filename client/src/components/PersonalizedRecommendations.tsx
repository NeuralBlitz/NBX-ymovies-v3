import { Movie } from "@/types/movie";
import MovieSlider from "./MovieSlider";
import { useAuth } from "@/hooks/useAuth";
import usePersonalizedRecommendations from "@/hooks/usePersonalizedRecommendations";

interface PersonalizedRecommendationsProps {
  userId?: string;
}

/**
 * Component that displays all personalized recommendation categories
 * Generated from the recommendation engine
 */
const PersonalizedRecommendations = ({ userId }: PersonalizedRecommendationsProps) => {
  const { isAuthenticated } = useAuth();
  const { 
    personalized, 
    isLoading, 
    hasPersonalizedRecommendations 
  } = usePersonalizedRecommendations();

  // Don't show anything if there's no data yet
  if (!hasPersonalizedRecommendations) {
    return null;
  }

  return (
    <>
      {personalized?.recommendation_categories.map((category, index) => (
        <MovieSlider
          key={`${category.category}-${index}`}
          title={category.category}
          movies={category.movies}
          isLoading={isLoading}
        />
      ))}
    </>
  );
};

export default PersonalizedRecommendations;
