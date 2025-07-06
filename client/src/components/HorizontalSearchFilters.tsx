import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Star, 
  Globe, 
  ArrowUpDown, 
  X, 
  MapPin,
  Clapperboard,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGenres, getTVGenres } from "@/lib/tmdb";
import { SearchFilters as SearchFiltersType } from "@/lib/tmdb";

interface HorizontalSearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  mediaType: 'movie' | 'tv' | 'both';
}

const HorizontalSearchFilters: React.FC<HorizontalSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  mediaType
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Sort options
  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'release_date.desc', label: 'Latest Release' },
    { value: 'release_date.asc', label: 'Oldest Release' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
  ];

  // Rating options
  const ratingOptions = [
    { value: 9, label: '9+' },
    { value: 8, label: '8+' },
    { value: 7, label: '7+' },
    { value: 6, label: '6+' },
    { value: 5, label: '5+' },
  ];

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
    setOpenDropdown(null);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Sort By */}
      <div className="relative">
        <Button
          variant={filters.sortBy ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 h-8"
          onClick={() => toggleDropdown('sortBy')}
        >
          <ArrowUpDown className="h-3 w-3" />
          <span className="text-xs">
            {filters.sortBy ? sortOptions.find(s => s.value === filters.sortBy)?.label : 'Sort'}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        {openDropdown === 'sortBy' && (
          <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => updateFilter('sortBy', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Year */}
      <div className="relative">
        <Button
          variant={filters.year ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 h-8"
          onClick={() => toggleDropdown('year')}
        >
          <Calendar className="h-3 w-3" />
          <span className="text-xs">{filters.year || 'Year'}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        {openDropdown === 'year' && (
          <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-50 min-w-[120px] max-h-60 overflow-y-auto">
            {years.map((year) => (
              <button
                key={year}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => updateFilter('year', year)}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="relative">
        <Button
          variant={filters.rating ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 h-8"
          onClick={() => toggleDropdown('rating')}
        >
          <Star className="h-3 w-3" />
          <span className="text-xs">{filters.rating ? `${filters.rating}+` : 'Rating'}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        {openDropdown === 'rating' && (
          <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-50 min-w-[120px] max-h-60 overflow-y-auto">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => updateFilter('rating', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8"
          onClick={clearAllFilters}
        >
          Clear All
        </Button>
      )}

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
};

export default HorizontalSearchFilters;
