import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HeroBanner from "@/components/HeroBanner";
import TVShowList from "@/components/TVShowList";
import { TVShow } from "@/types/tvshow";
import { 
  getTrendingTVShows,
  getPopularTVShows,
  getTopRatedTVShows,
  getTVShowsByGenre
} from "@/lib/tmdb";

const TVShows = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [featuredShow, setFeaturedShow] = useState<TVShow | null>(null);

  // Fetch trending TV shows
  const { data: trendingShows, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['/api/trending/tv'],
    queryFn: () => getTrendingTVShows(),
  });

  // Fetch popular TV shows  
  const { data: popularShows, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['/api/tv/popular'],
    queryFn: () => getPopularTVShows(),
  });

  // Fetch top rated TV shows
  const { data: topRatedShows, isLoading: isLoadingTopRated } = useQuery({
    queryKey: ['/api/tv/top-rated'],
    queryFn: () => getTopRatedTVShows(),
  });

  // Fetch TV shows by genres
  const { data: actionShows } = useQuery({
    queryKey: ['/api/tv/genre/28'],
    queryFn: () => getTVShowsByGenre(28), // Action genre ID
  });

  const { data: dramaShows } = useQuery({
    queryKey: ['/api/tv/genre/18'],
    queryFn: () => getTVShowsByGenre(18), // Drama genre ID
  });

  const { data: comedyShows } = useQuery({
    queryKey: ['/api/tv/genre/35'],
    queryFn: () => getTVShowsByGenre(35), // Comedy genre ID
  });

  // Select a random featured show for the hero banner
  useEffect(() => {
    if (trendingShows && trendingShows.length > 0) {
      // Pick a random show from the top 5 trending shows
      const randomIndex = Math.floor(Math.random() * Math.min(5, trendingShows.length));
      setFeaturedShow(trendingShows[randomIndex]);
    }
  }, [trendingShows]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Get the active shows based on selected tab
  const getActiveShows = () => {
    switch (activeTab) {
      case "trending":
        return trendingShows || [];
      case "popular":
        return popularShows || [];
      case "top-rated":
        return topRatedShows || [];
      default:
        return trendingShows || [];
    }
  };

  // Loading skeleton
  if (isLoadingTrending && isLoadingPopular && isLoadingTopRated) {
    return (
      <div className="pt-16">
        <Skeleton className="w-full h-[60vh]" />
        <div className="container mx-auto px-4 mt-8">
          <Skeleton className="w-48 h-8 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(6)
              .fill("")
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Hero Banner with featured TV show */}
      {featuredShow && (
        <HeroBanner
          movie={{
            id: featuredShow.id,
            title: featuredShow.name,
            overview: featuredShow.overview,
            backdrop_path: featuredShow.backdrop_path,
            poster_path: featuredShow.poster_path,
            release_date: featuredShow.first_air_date,
            vote_average: featuredShow.vote_average,
            vote_count: featuredShow.vote_count,
            genre_ids: featuredShow.genre_ids,
            adult: false,
            original_language: featuredShow.original_language,
            original_title: featuredShow.original_name,
            popularity: featuredShow.popularity,
            video: false
          }}
        />
      )}

      {/* TV Show Categories */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="trending" className="mb-8" onValueChange={handleTabChange}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" className="text-sm" asChild>
              <a href="/search?type=tv">Browse All TV Shows</a>
            </Button>
          </div>
          
          <TabsContent value="trending" className="mt-0">
            <TVShowList 
              title=""
              shows={trendingShows || []}
              defaultLayout="list"
            />
          </TabsContent>
          
          <TabsContent value="popular" className="mt-0">
            <TVShowList 
              title=""
              shows={popularShows || []}
              defaultLayout="list"
            />
          </TabsContent>
          
          <TabsContent value="top-rated" className="mt-0">
            <TVShowList 
              title=""
              shows={topRatedShows || []}
              defaultLayout="list"
            />
          </TabsContent>
        </Tabs>

        {/* Genre Based TV Show Sections */}
        {actionShows && actionShows.length > 0 && (
          <TVShowList 
            title="Action TV Shows"
            shows={actionShows}
            className="mb-10"
            defaultLayout="list"
          />
        )}
        
        {dramaShows && dramaShows.length > 0 && (
          <TVShowList 
            title="Drama TV Shows"
            shows={dramaShows}
            className="mb-10"
            defaultLayout="list"
          />
        )}
        
        {comedyShows && comedyShows.length > 0 && (
          <TVShowList 
            title="Comedy TV Shows"
            shows={comedyShows}
            className="mb-10"
            defaultLayout="list"
          />
        )}
      </div>
    </div>
  );
};

export default TVShows;
