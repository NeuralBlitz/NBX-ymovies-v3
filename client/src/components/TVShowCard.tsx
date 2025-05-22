import React from "react";
import { Link } from "wouter";
import { TVShow } from "@/types/tvshow";
import { cn } from "@/lib/utils";

interface TVShowCardProps {
  show: TVShow;
  hideInfo?: boolean;
  className?: string;
}

const TVShowCard = ({ show, hideInfo = false, className }: TVShowCardProps) => {
  const posterPath = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "/placeholder-poster.png";

  return (
    <Link href={`/tv/${show.id}`}>
      <div
        className={cn(
          "group relative aspect-[2/3] overflow-hidden rounded-md bg-secondary/20 transition-all hover:ring-2 hover:ring-primary",
          className
        )}
      >
        <img
          src={posterPath}
          alt={show.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {!hideInfo && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex items-center space-x-2">
              {show.vote_average > 0 && (
                <span className="text-xs font-semibold text-yellow-400">
                  ★ {show.vote_average.toFixed(1)}
                </span>
              )}
              {show.first_air_date && (
                <span className="text-xs text-gray-300">
                  {new Date(show.first_air_date).getFullYear()}
                </span>
              )}
            </div>
            <h3 className="mt-1 font-medium">{show.name}</h3>
          </div>
        )}
      </div>
    </Link>
  );
};

export default TVShowCard;
