import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie";
import MovieSlider from "./MovieSlider";

interface BecauseYouLikedProps {
  movieId: number;
  movieTitle: string;
}

interface RecommendationResponse {
  recommendations: Movie[];
  sourceMovie: Movie;
  category: string;
}

/**
 * A specialized section that shows recommendations based on a movie the user liked
 */
const BecauseYouLikedSection = ({ movieId, movieTitle }: BecauseYouLikedProps) => {
  const [isError, setIsError] = useState(false);

  // Fetch "because you liked" recommendations
  const { data, isLoading, error } = useQuery<RecommendationResponse>({
    queryKey: [`/api/recommendations/because-you-liked/${movieId}`],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations/because-you-liked/${movieId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
  
  // Handle errors in useEffect, since v5 doesn't have onError callback
  React.useEffect(() => {
    if (error) {
      console.error(`Error fetching because-you-liked recommendations: ${error}`);
      setIsError(true);
    }
  }, [error]);

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
