import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Play, Clock } from "lucide-react";

interface WatchHistoryItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  runtime?: number;
  watchData: {
    watchProgress: number;
    watchCount: number;
    completed: boolean;
    rating: number | null;
    lastStoppedAt: number;
    watchDuration: number;
    watchedAt: string | null;
  };
}

const ContinueWatching = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  const { data: history, isLoading } = useQuery<WatchHistoryItem[]>({
    queryKey: ["continue-watching"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/history");
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const inProgress = React.useMemo(() => {
    if (!history) return [];
    return history
      .filter((item) => item.watchData.watchProgress > 0 && !item.watchData.completed)
      .sort((a, b) => {
        const dateA = a.watchData.watchedAt ? new Date(a.watchData.watchedAt).getTime() : 0;
        const dateB = b.watchData.watchedAt ? new Date(b.watchData.watchedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 20);
  }, [history]);

  if (!isAuthenticated || isLoading || inProgress.length === 0) return null;

  const formatTimeLeft = (progress: number, runtime?: number) => {
    if (!runtime) return `${progress}%`;
    const minutesLeft = Math.round(runtime * (1 - progress / 100));
    if (minutesLeft < 60) return `${minutesLeft}m left`;
    const h = Math.floor(minutesLeft / 60);
    const m = minutesLeft % 60;
    return `${h}h ${m}m left`;
  };

  return (
    <section className="mt-8 px-4 relative group/slider w-full">
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-bold ml-2 group-hover/slider:text-red-600 transition-colors duration-300">
          Continue Watching
        </h2>
        <div className="h-px flex-grow bg-gray-800 ml-4 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="relative overflow-visible">
        <div
          className="flex overflow-x-auto gap-4 pb-6 pt-2 px-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {inProgress.map((item) => {
            const title = item.title || item.name || "Untitled";
            const posterUrl = item.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
              : item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : null;
            const isTV = !!item.name;

            return (
              <div
                key={item.id}
                className="flex-shrink-0 w-72 cursor-pointer group"
                onClick={() => navigate(isTV ? `/tv/${item.id}` : `/movie/${item.id}`)}
              >
                <div className="relative rounded-lg overflow-hidden bg-secondary/20 aspect-video">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                      <span className="text-muted-foreground text-xs">No image</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-medium text-sm line-clamp-1 mb-2">{title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeLeft(item.watchData.watchProgress, item.runtime)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-red-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${item.watchData.watchProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-0 pointer-events-none" />
      </div>
    </section>
  );
};

export default ContinueWatching;
