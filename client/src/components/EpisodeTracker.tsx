import React, { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Check, Eye, EyeOff, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number | null;
  vote_average: number;
  season_number: number;
}

interface EpisodeStatus {
  episodeId: number;
  seasonNumber: number;
  episodeNumber: number;
  watched: boolean;
  watchedAt?: string;
}

interface EpisodeTrackerProps {
  tvShowId: number;
  episodes: Episode[];
  seasonNumber: number;
  totalSeasons: number;
}

const EpisodeTracker = ({ tvShowId, episodes, seasonNumber, totalSeasons }: EpisodeTrackerProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(null);

  const storageKey = `episode-tracking-${tvShowId}`;

  const getTrackedEpisodes = useCallback((): Record<string, EpisodeStatus> => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  const [trackedEpisodes, setTrackedEpisodes] = useState<Record<string, EpisodeStatus>>(getTrackedEpisodes);

  const episodeKey = (season: number, episode: number) => `s${season}e${episode}`;

  const isEpisodeWatched = useCallback(
    (season: number, episode: number) => {
      return trackedEpisodes[episodeKey(season, episode)]?.watched || false;
    },
    [trackedEpisodes]
  );

  const toggleEpisode = useCallback(
    (season: number, episode: number, episodeId: number) => {
      const key = episodeKey(season, episode);
      const current = trackedEpisodes[key];
      const newStatus: EpisodeStatus = {
        episodeId,
        seasonNumber: season,
        episodeNumber: episode,
        watched: !current?.watched,
        watchedAt: !current?.watched ? new Date().toISOString() : undefined,
      };

      const updated = { ...trackedEpisodes, [key]: newStatus };
      setTrackedEpisodes(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    },
    [trackedEpisodes, storageKey]
  );

  const markSeasonWatched = useCallback(() => {
    const updated = { ...trackedEpisodes };
    episodes.forEach((ep) => {
      const key = episodeKey(seasonNumber, ep.episode_number);
      updated[key] = {
        episodeId: ep.id,
        seasonNumber,
        episodeNumber: ep.episode_number,
        watched: true,
        watchedAt: new Date().toISOString(),
      };
    });
    setTrackedEpisodes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast({
      title: `Season ${seasonNumber} marked as watched`,
      description: `${episodes.length} episodes marked as complete.`,
    });
  }, [trackedEpisodes, episodes, seasonNumber, storageKey, toast]);

  const markSeasonUnwatched = useCallback(() => {
    const updated = { ...trackedEpisodes };
    episodes.forEach((ep) => {
      const key = episodeKey(seasonNumber, ep.episode_number);
      if (updated[key]) {
        updated[key].watched = false;
        updated[key].watchedAt = undefined;
      }
    });
    setTrackedEpisodes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [trackedEpisodes, episodes, seasonNumber, storageKey]);

  const watchedCount = useMemo(() => {
    return episodes.filter((ep) => isEpisodeWatched(seasonNumber, ep.episode_number)).length;
  }, [episodes, seasonNumber, isEpisodeWatched]);

  const seasonProgress = episodes.length > 0 ? Math.round((watchedCount / episodes.length) * 100) : 0;
  const allWatched = watchedCount === episodes.length && episodes.length > 0;

  const nextUnwatched = useMemo(() => {
    return episodes.find((ep) => !isEpisodeWatched(seasonNumber, ep.episode_number));
  }, [episodes, seasonNumber, isEpisodeWatched]);

  const totalWatchedAcrossSeasons = useMemo(() => {
    return Object.values(trackedEpisodes).filter((s) => s.watched).length;
  }, [trackedEpisodes]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!episodes || episodes.length === 0) {
    return (
      <Card className="bg-secondary/10 p-6 text-center">
        <p className="text-muted-foreground">No episodes available for this season.</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {watchedCount} / {episodes.length} episodes watched
          </div>
          <div className="w-32 bg-secondary/30 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${seasonProgress}%` }}
            />
          </div>
          {allWatched && <span className="text-xs text-green-400 font-medium">Complete</span>}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              {!allWatched ? (
                <Button variant="outline" size="sm" className="text-xs" onClick={markSeasonWatched}>
                  <Check className="h-3 w-3 mr-1" /> Mark Season Watched
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-xs" onClick={markSeasonUnwatched}>
                  <EyeOff className="h-3 w-3 mr-1" /> Reset Season
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {nextUnwatched && !allWatched && (
        <Card className="bg-primary/5 border-primary/20 p-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Next up:</span>
            <span className="font-medium">
              Episode {nextUnwatched.episode_number} — {nextUnwatched.name}
            </span>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {episodes.map((episode) => {
          const watched = isEpisodeWatched(seasonNumber, episode.episode_number);
          const isExpanded = expandedEpisode === episode.id;

          return (
            <Card
              key={episode.id}
              className={`bg-secondary/10 transition-all duration-200 ${watched ? "border-green-500/20" : ""}`}
            >
              <div className="flex gap-4 p-4">
                <div className="flex-shrink-0 relative">
                  {episode.still_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                      alt={episode.name}
                      className={`w-32 h-20 object-cover rounded transition-opacity duration-200 ${watched ? "opacity-50" : ""}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-32 h-20 bg-secondary/20 rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                  {watched && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-base ${watched ? "text-muted-foreground" : ""}`}>
                        {episode.episode_number}. {episode.name}
                      </h3>
                      {watched && <span className="text-xs text-green-400 font-medium">Watched</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {episode.vote_average > 0 && (
                        <div className="text-yellow-400 text-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {episode.vote_average.toFixed(1)}
                        </div>
                      )}
                      {isAuthenticated && (
                        <Button
                          variant={watched ? "default" : "outline"}
                          size="sm"
                          className={`h-7 text-xs ${watched ? "bg-green-600 hover:bg-green-700" : ""}`}
                          onClick={() => toggleEpisode(seasonNumber, episode.episode_number, episode.id)}
                        >
                          {watched ? (
                            <>
                              <Check className="h-3 w-3 mr-1" /> Watched
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" /> Mark Watched
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                    {episode.air_date && <span>{formatDate(episode.air_date)}</span>}
                    {episode.runtime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {episode.runtime}m
                      </span>
                    )}
                  </div>

                  {episode.overview && (
                    <>
                      <p
                        className={`text-sm text-gray-300 ${isExpanded ? "" : "line-clamp-2"} cursor-pointer`}
                        onClick={() => setExpandedEpisode(isExpanded ? null : episode.id)}
                      >
                        {episode.overview}
                      </p>
                      {episode.overview.length > 120 && (
                        <button
                          className="text-xs text-primary hover:underline mt-1 bg-transparent border-none p-0 cursor-pointer"
                          onClick={() => setExpandedEpisode(isExpanded ? null : episode.id)}
                        >
                          {isExpanded ? "Show less" : "Show more"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {totalWatchedAcrossSeasons > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {totalWatchedAcrossSeasons} total episodes tracked across all seasons
          </p>
        </div>
      )}
    </div>
  );
};

export default EpisodeTracker;
