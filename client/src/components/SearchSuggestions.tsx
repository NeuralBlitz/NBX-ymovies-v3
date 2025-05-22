import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Film, Tv, Loader2 } from "lucide-react";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { searchMulti, MediaItem } from "@/lib/tmdb";

interface SearchSuggestionsProps {
  query: string;
  onItemClick: () => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ query, onItemClick }) => {
  // Fetch search results
  const { data: results, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/search/multi', query],
    queryFn: () => searchMulti(query),
    enabled: query.length > 0,
    staleTime: 60000, // Cache results for 1 minute
  });

  // Don't show anything if there's no query
  if (!query || query.length < 2) {
    return null;
  }

  return (
    <div className="absolute top-full right-0 mt-2 w-96 z-50 bg-black/95 border border-gray-800 rounded-md shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Searching...</span>
        </div>
      ) : !results || results.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
          <Link 
            href={`/search?q=${encodeURIComponent(query)}`}
            className="text-xs text-primary hover:underline mt-2 inline-block"
            onClick={onItemClick}
          >
            See all search results
          </Link>
        </div>
      ) : (
        <>
          <div className="p-3 max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              {results.slice(0, 6).map((item) => (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  href={
                    item.media_type === "movie"
                      ? `/movie/${item.id}`
                      : `/tv/${item.id}`
                  }
                  className="flex items-start p-2 rounded-md hover:bg-gray-800/50 transition-colors"
                  onClick={onItemClick}
                >
                  <div className="flex-shrink-0 w-12 h-16 bg-gray-800 rounded overflow-hidden mr-3">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt={item.media_type === "movie" ? (item as Movie).title : (item as TVShow).name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        {item.media_type === "movie" ? (
                          <Film className="w-6 h-6 text-gray-600" />
                        ) : (
                          <Tv className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {item.media_type === "movie" 
                        ? (item as Movie).title 
                        : (item as TVShow).name}
                    </h4>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-muted-foreground mr-2">
                        {item.media_type === "movie" 
                          ? new Date((item as Movie).release_date).getFullYear() 
                          : new Date((item as TVShow).first_air_date).getFullYear()}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded-sm flex items-center">
                        {item.media_type === "movie" ? (
                          <Film className="w-3 h-3 mr-1" />
                        ) : (
                          <Tv className="w-3 h-3 mr-1" />
                        )}
                        {item.media_type === "movie" ? "Movie" : "TV Show"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.overview}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 p-3">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="text-sm flex justify-center items-center text-primary hover:underline"
              onClick={onItemClick}
            >
              See all results for "{query}"
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
