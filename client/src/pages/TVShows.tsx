import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HeroBanner from "@/components/HeroBanner";
import MovieSlider from "@/components/MovieSlider";
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
          title={featuredShow.name}
          overview={featuredShow.overview}
          backdropPath={featuredShow.backdrop_path || ""}
          releaseDate={featuredShow.first_air_date}
          voteAverage={featuredShow.vote_average}
          mediaType="tv"
          mediaId={featuredShow.id}
          mediaGenres={featuredShow.genre_ids}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingShows?.slice(0, 12).map((show) => (
                <div key={show.id} className="space-y-2">
                  <a href={`/tv/${show.id}`} className="block">
                    <img
                      src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "/placeholder-poster.png"}
                      alt={show.name}
                      className="w-full aspect-[2/3] object-cover rounded-md hover:ring-2 hover:ring-primary transition-all"
                    />
                  </a>
                  <h3 className="font-medium text-sm line-clamp-1">{show.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'} • {show.vote_average.toFixed(1)}★
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="popular" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularShows?.slice(0, 12).map((show) => (
                <div key={show.id} className="space-y-2">
                  <a href={`/tv/${show.id}`} className="block">
                    <img
                      src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "/placeholder-poster.png"}
                      alt={show.name}
                      className="w-full aspect-[2/3] object-cover rounded-md hover:ring-2 hover:ring-primary transition-all"
                    />
                  </a>
                  <h3 className="font-medium text-sm line-clamp-1">{show.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'} • {show.vote_average.toFixed(1)}★
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="top-rated" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topRatedShows?.slice(0, 12).map((show) => (
                <div key={show.id} className="space-y-2">
                  <a href={`/tv/${show.id}`} className="block">
                    <img
                      src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "/placeholder-poster.png"}
                      alt={show.name}
                      className="w-full aspect-[2/3] object-cover rounded-md hover:ring-2 hover:ring-primary transition-all"
                    />
                  </a>
                  <h3 className="font-medium text-sm line-clamp-1">{show.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'} • {show.vote_average.toFixed(1)}★
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* TV Shows by Genre */}
        <section className="space-y-12 mt-12">
          {actionShows && actionShows.length > 0 && (
            <TVShowList title="Action & Adventure" shows={actionShows.slice(0, 6)} />
          )}
          
          {dramaShows && dramaShows.length > 0 && (
            <TVShowList title="Drama Series" shows={dramaShows.slice(0, 6)} />
          )}
          
          {comedyShows && comedyShows.length > 0 && (
            <TVShowList title="Comedy Series" shows={comedyShows.slice(0, 6)} />
          )}
        </section>
      </div>
    </div>
  );
};

export default TVShows;
