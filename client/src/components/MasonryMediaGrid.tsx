import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Play } from "lucide-react";
import { Link } from "wouter";

interface MasonryMediaGridProps {
  items: any[];
  onRemove?: (id: number) => void;
  getMediaTitle: (media: any) => string;
  getMediaPosterUrl: (media: any) => string;
  getMediaReleaseYear: (media: any) => string | null;
  selectable?: boolean;
  selectedIds?: number[] | Set<number>;
  onToggleSelect?: (id: number) => void;
}

const MasonryMediaGrid: React.FC<MasonryMediaGridProps> = ({
  items,
  onRemove,
  getMediaTitle,
  getMediaPosterUrl,
  getMediaReleaseYear,
  selectable = false,
  selectedIds,
  onToggleSelect
}) => {
  const isSelected = (id: number) => {
    if (!selectedIds) return false;
    if (Array.isArray(selectedIds)) return selectedIds.includes(id);
    return (selectedIds as Set<number>).has(id);
  };

  return (
    <div className="[column-fill:_balance] columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
      {items.map((media) => {
        const title = getMediaTitle(media);
        const poster = getMediaPosterUrl(media);
        const year = getMediaReleaseYear(media);
        const isTv = !!media.first_air_date || !!media.original_name;
        const href = isTv ? `/tv/${media.id}` : `/movie/${media.id}`;
        return (
          <div key={media.id} className="mb-4 break-inside-avoid">
            <div className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm transition-transform duration-300 hover:shadow-xl hover:-translate-y-0.5">
              {/* Selection */}
              {selectable && (
                <div className="absolute top-2 left-2 z-20">
                  <Checkbox
                    checked={isSelected(media.id)}
                    onCheckedChange={() => onToggleSelect && onToggleSelect(media.id)}
                  />
                </div>
              )}
              {/* Remove */}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-20 w-8 h-8 p-0 bg-black/50 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(media.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              <Link href={href}>
                <img
                  src={poster}
                  alt={title}
                  loading="lazy"
                  className="w-full h-auto rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Hover content */}
                <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{title}</div>
                      <div className="text-xs text-white/70">{year}</div>
                    </div>
                    <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-white/20" asChild>
                      <Link href={href}>
                        <Play className="w-4 h-4 mr-1" /> Play
                      </Link>
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MasonryMediaGrid;
