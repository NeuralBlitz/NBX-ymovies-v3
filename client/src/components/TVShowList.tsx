import TVShowCard from "./TVShowCard";
import { TVShow } from "@/types/tvshow";

interface TVShowListProps {
  title: string;
  shows: TVShow[];
  className?: string;
}

const TVShowList = ({ title, shows, className }: TVShowListProps) => {
  if (!shows || shows.length === 0) return null;
  
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
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
    </div>
  );
};

export default TVShowList;
