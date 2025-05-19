import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Movie } from "@/types/movie";
import MovieSlider from "./MovieSlider";

interface BecauseYouLikedProps {
  movieId: number;
  movieTitle: string;
}

/**
 * A specialized section that shows recommendations based on a movie the user liked
 */
const BecauseYouLikedSection = ({ movieId, movieTitle }: BecauseYouLikedProps) => {
  const [isError, setIsError] = useState(false);

  // Fetch "because you liked" recommendations
  const { data, isLoading, error } = useQuery<{
    recommendations: Movie[];
    sourceMovie: Movie;
    category: string;
  }>({
    queryKey: [`/api/recommendations/because-you-liked/${movieId}`],
    staleTime: 1000 * 60 * 10, // 10 minutes
    // Handle errors gracefully
    onError: () => {
      setIsError(true);
    },
    // Only retry a few times
    retry: 2
  });

  // If there was an error or no recommendations, don't show the section
  if (isError || error || !data || !data.recommendations || data.recommendations.length === 0) {
    return null;
  }

  return (
    <MovieSlider
      title={data.category || `Because you liked ${movieTitle}`}
      movies={data.recommendations}
      isLoading={isLoading}
    />
  );
};

export default BecauseYouLikedSection;
