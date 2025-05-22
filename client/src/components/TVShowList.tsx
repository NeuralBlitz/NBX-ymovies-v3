import React, { useState } from "react";
import TVShowCard from "./TVShowCard";
import HorizontalTVShowCard from "./HorizontalTVShowCard";
import { TVShow } from "@/types/tvshow";
import { Button } from "@/components/ui/button";
import { Grid, LayoutList } from "lucide-react";

interface TVShowListProps {
  title: string;
  shows: TVShow[];
  className?: string;
  defaultLayout?: "grid" | "list";
}

const TVShowList = ({ title, shows, className, defaultLayout = "list" }: TVShowListProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">(defaultLayout);
  
  if (!shows || shows.length === 0) return null;
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {shows.map((show) => (
            <div key={show.id} className="space-y-2">
              <TVShowCard show={show} hideInfo />
              <h3 className="font-medium text-sm">{show.name}</h3>
              <p className="text-xs text-muted-foreground">
                {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {shows.map((show) => (
            <HorizontalTVShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TVShowList;
