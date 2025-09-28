import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { 
  X, 
  Heart, 
  Bookmark, 
  Play, 
  Grid3X3, 
  List,
  Calendar,
  Star,
  TrendingUp
} from "lucide-react";
import MediaGrid from "@/components/MediaGrid";
import MasonryMediaGrid from "@/components/MasonryMediaGrid";

type MediaItem = Movie | TVShow;

const MyList = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "mosaic">("grid");
  const { 
    preferences, 
    isLoading: isPreferencesLoading,
    addToFavorites,
    addToWatchlist,
    removeFromFavorites,
    removeFromWatchlist,
    createCollection,
    renameCollection,
    deleteCollection,
    addItemToCollection,
    removeItemFromCollection,
  } = useUserPreferences();
  
  // Controls state
  const [sortBy, setSortBy] = useState<"recent" | "title" | "year" | "rating">("recent");
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "tv">("all");
  const [query, setQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Set the active tab based on URL parameter
  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get("tab");
    if (tabParam === "favorites") {
      setActiveTab("favorites");
    } else if (tabParam === "watchlist") {
      setActiveTab("watchlist");
    } else if (tabParam === "collections") {
      setActiveTab("collections");
    }
  }, [location]);

  // Get watchlist and favorites from user preferences
  const watchlist = preferences?.watchlist || [];
  const favorites = preferences?.favoriteMovies || [];
  const collections = preferences?.collections || [];

  // Collections UI state
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(collections[0]?.id || null);
  useEffect(() => {
    if (collections.length && !activeCollectionId) {
      setActiveCollectionId(collections[0].id);
    }
  }, [collections, activeCollectionId]);

  // Derived helpers
  const isTVItem = (media: MediaItem) => !!(media as any).first_air_date || !!(media as any).original_name;

  const applyFilters = (items: MediaItem[]) => {
    let out = [...items];
    // Filter by type
    if (typeFilter !== "all") {
      out = out.filter(i => typeFilter === "tv" ? isTVItem(i) : !isTVItem(i));
    }
    // Query filter
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(i => getMediaTitle(i).toLowerCase().includes(q));
    }
    // Sort
    out.sort((a, b) => {
      if (sortBy === "title") {
        return getMediaTitle(a).localeCompare(getMediaTitle(b));
      }
      if (sortBy === "year") {
        const ay = Number(getMediaReleaseYear(a) || 0);
        const by = Number(getMediaReleaseYear(b) || 0);
        return by - ay; // newest first
      }
      if (sortBy === "rating") {
        const ar = (a as any).vote_average || 0;
        const br = (b as any).vote_average || 0;
        return br - ar;
      }
      // recent: preserve insertion order (assumed recency)
      return 0;
    });
    return out;
  };

  const displayWatchlist = useMemo(() => applyFilters(watchlist), [watchlist, sortBy, typeFilter, query]);
  const displayFavorites = useMemo(() => applyFilters(favorites), [favorites, sortBy, typeFilter, query]);

  // Reset selection on tab or filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, sortBy, typeFilter, query, viewMode]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    const source = activeTab === "watchlist" ? displayWatchlist : displayFavorites;
    setSelectedIds(new Set(source.map(i => i.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());
  // Utility functions for handling media items
  const getMediaTitle = (media: MediaItem): string => {
    return (media as any).title || (media as any).name || "Unknown";
  };
  
  const getMediaReleaseYear = (media: MediaItem): string | null => {
    if ((media as any).release_date) {
      return new Date((media as any).release_date).getFullYear().toString();
    }
    if ((media as any).first_air_date) {
      return new Date((media as any).first_air_date).getFullYear().toString();
    }
    return null;
  };
  
  const getMediaPosterUrl = (media: MediaItem): string => {
    return (media as any).poster_path 
      ? `https://image.tmdb.org/t/p/w500${(media as any).poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Poster";
  };
  // Handle removing from watchlist
  const handleRemoveFromWatchlist = (movieId: number) => {
    removeFromWatchlist(movieId);
    toast({
      title: "Removed from Watchlist",
      description: "The title has been removed from your watchlist.",
    });
  };

  // Handle removing from favorites
  const handleRemoveFromFavorites = (movieId: number) => {
    removeFromFavorites(movieId);
    toast({
      title: "Removed from Favorites",
      description: "The title has been removed from your favorites.",
    });
  };

  // Bulk Actions
  const bulkRemove = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    if (activeTab === "watchlist") {
      await Promise.all(ids.map(id => removeFromWatchlist(id)));
      toast({ title: "Removed from Watchlist", description: `${ids.length} item(s) removed.` });
    } else if (activeTab === "favorites") {
      await Promise.all(ids.map(id => removeFromFavorites(id)));
      toast({ title: "Removed from Favorites", description: `${ids.length} item(s) removed.` });
    }
    clearSelection();
  };

  const bulkAddToOther = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    const source = activeTab === "watchlist" ? watchlist : favorites;
    const byId = new Map(source.map(m => [m.id, m] as const));
    if (activeTab === "watchlist") {
      await Promise.all(ids.map(id => {
        const m = byId.get(id);
        if (!m) return Promise.resolve();
        // If TV show, ensure title is set for compatibility
        const payload: any = { ...m };
        if (!(payload as any).title && (payload as any).name) payload.title = payload.name;
        return addToFavorites(payload);
      }));
      toast({ title: "Added to Favorites", description: `${ids.length} item(s) added.` });
    } else if (activeTab === "favorites") {
      await Promise.all(ids.map(id => {
        const m = byId.get(id);
        if (!m) return Promise.resolve();
        const payload: any = { ...m };
        if (!(payload as any).title && (payload as any).name) payload.title = payload.name;
        return addToWatchlist(payload);
      }));
      toast({ title: "Added to Watchlist", description: `${ids.length} item(s) added.` });
    }
    clearSelection();
  };
  // Get total items count
  const getTotalItems = () => {
    return watchlist.length + favorites.length;
  };

  // Get recent activity (latest additions)
  const getRecentActivity = () => {
    const recentFavorites = favorites.slice(0, 3).map(item => ({ ...item, type: 'favorite' }));
    const recentWatchlist = watchlist.slice(0, 3).map(item => ({ ...item, type: 'watchlist' }));
    
    return [...recentFavorites, ...recentWatchlist].slice(0, 4);
  };
  // Loading state
  if (isPreferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30">
        <div className="container mx-auto pt-32 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-6 mb-4" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <LoadingSkeleton key={i} variant="movie-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unique spotlight item (top pick from current tab after filters)
  const spotlightItem = useMemo(() => {
    const source = activeTab === "favorites" ? displayFavorites : displayWatchlist;
    return source[0];
  }, [activeTab, displayFavorites, displayWatchlist]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30">
      {/* Spotlight Header - distinct, cinematic */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-background" />
        {spotlightItem && (
          <img
            src={getMediaPosterUrl(spotlightItem)}
            alt={getMediaTitle(spotlightItem)}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            loading="lazy"
          />
        )}
        <div className="relative container mx-auto pt-28 pb-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">
                  My List
                </h1>
                <p className="text-muted-foreground text-base mt-2">
                  A living library of what you love and what you’ll watch next
                </p>
              </div>
              {/* Collections chips */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">{favorites.length} Favorites</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">{watchlist.length} In Watchlist</span>
                <span className="px-3 py-1 rounded-full bg-foreground/10 text-foreground/80 text-xs border border-border/50">{getTotalItems()} Total</span>
              </div>
              {/* Spotlight card */}
              {spotlightItem && (
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                  <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                    <img src={getMediaPosterUrl(spotlightItem)} alt={getMediaTitle(spotlightItem)} className="w-full h-[320px] object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="text-white font-semibold text-lg truncate">{getMediaTitle(spotlightItem)}</div>
                      <div className="text-white/70 text-xs">{getMediaReleaseYear(spotlightItem)}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex flex-col justify-between">
                    <div className="text-sm text-muted-foreground">
                      Customize how you see your library. Try the new Mosaic view for a visually rich layout.
                    </div>
                    <div className="flex gap-2">
                      <Button variant={viewMode === 'mosaic' ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode('mosaic')}>Mosaic</Button>
                      <Button variant={viewMode === 'grid' ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>Grid</Button>
                      <Button variant={viewMode === 'list' ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode('list')}>List</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col gap-4 mb-6">
              {/* Primary Tabs */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="watchlist" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Watchlist</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Favorites</span>
                </TabsTrigger>
                  <TabsTrigger value="collections" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span className="hidden sm:inline">Collections</span>
                  </TabsTrigger>
              </TabsList>
              
              {/* View Mode Toggle (only show when not on overview) */}
              {activeTab !== "overview" && (
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/50">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}
              </div>

              {/* Controls: filter, sort, search, selection (when not overview) */}
              {activeTab !== "overview" && activeTab !== "collections" && (
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    {/* Type filter */}
                    <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                      <SelectTrigger className="w-[140px] bg-card/50 border-border/50">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="movie">Movies</SelectItem>
                        <SelectItem value="tv">TV Shows</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                      <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recently added</SelectItem>
                        <SelectItem value="title">Title (A–Z)</SelectItem>
                        <SelectItem value="year">Release year</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Selection mode */}
                    <Toggle
                      pressed={selectionMode}
                      onPressedChange={setSelectionMode}
                      className="h-9 px-3 bg-card/50 border border-border/50"
                    >
                      Select
                    </Toggle>
                  </div>
                  {/* Search */}
                  <div className="flex-1 md:max-w-sm md:ml-auto">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search in your list..."
                      className="bg-card/50 border-border/50"
                    />
                  </div>
                </div>
              )}
            </div>
              {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:bg-blue-500/5 transition-all duration-200 hover:scale-105">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Bookmark className="w-5 h-5" />
                      Watchlist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{watchlist.length}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Items ready to watch
                    </p>
                    {watchlist.length > 0 && (
                      <div className="space-y-2">
                        {watchlist.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs truncate">{getMediaTitle(item)}</span>
                          </div>
                        ))}
                        {watchlist.length > 2 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500/50 rounded-full"></div>
                            <span className="text-xs text-muted-foreground">+{watchlist.length - 2} more</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:bg-red-500/5 transition-all duration-200 hover:scale-105">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Heart className="w-5 h-5" />
                      Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600 mb-2">{favorites.length}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Movies and shows you love
                    </p>
                    {favorites.length > 0 && (
                      <div className="space-y-2">
                        {favorites.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-xs truncate">{getMediaTitle(item)}</span>
                          </div>
                        ))}
                        {favorites.length > 2 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500/50 rounded-full"></div>
                            <span className="text-xs text-muted-foreground">+{favorites.length - 2} more</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {getRecentActivity().length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {getRecentActivity().map((item, index) => (
                        <div key={`${item.id}-${index}`} className="space-y-2">
                          <div className="relative group">
                            <img
                              src={getMediaPosterUrl(item)}
                              alt={getMediaTitle(item)}
                              className="w-full aspect-[2/3] object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                            />                            <div className="absolute top-2 right-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  (item as any).type === 'favorite' ? 'bg-red-500/20 text-red-600' :
                                  'bg-blue-500/20 text-blue-600'
                                }`}
                              >
                                {(item as any).type === 'favorite' ? 'Loved' : 'Added'}
                              </Badge>
                            </div>
                          </div>
                          <h3 className="text-sm font-medium truncate">{getMediaTitle(item)}</h3>
                          <p className="text-xs text-muted-foreground">{getMediaReleaseYear(item)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State for Overview */}
              {getTotalItems() === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Your list is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your personal collection of movies and TV shows
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                      <Link href="/">Discover Movies</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/tv-shows">Browse TV Shows</Link>
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Watchlist Tab */}
            <TabsContent value="watchlist">
              {/* Bulk actions toolbar */}
              {selectionMode && (
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-card/50 border border-border/50 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">
                    {selectedIds.size} selected
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={selectAllVisible}>Select all</Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
                    <Button variant="outline" size="sm" onClick={bulkAddToOther}>Add to Favorites</Button>
                    <Button variant="destructive" size="sm" onClick={bulkRemove}>Remove</Button>
                  </div>
                </div>
              )}
              {viewMode === 'mosaic' ? (
                <MasonryMediaGrid
                  items={displayWatchlist}
                  onRemove={handleRemoveFromWatchlist}
                  getMediaTitle={getMediaTitle}
                  getMediaPosterUrl={getMediaPosterUrl}
                  getMediaReleaseYear={getMediaReleaseYear}
                  selectable={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />
              ) : (
                <MediaGrid 
                  title="My Watchlist"
                  items={displayWatchlist}
                  isLoading={isPreferencesLoading}
                  onRemove={handleRemoveFromWatchlist}
                  emptyMessage="Your watchlist is empty."
                  emptyAction={<Button asChild><Link href="/">Discover Movies</Link></Button>}
                  getMediaTitle={getMediaTitle}
                  getMediaPosterUrl={getMediaPosterUrl}
                  getMediaReleaseYear={getMediaReleaseYear}
                  viewMode={viewMode as any}
                  selectable={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />
              )}
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              {selectionMode && (
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-card/50 border border-border/50 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">
                    {selectedIds.size} selected
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={selectAllVisible}>Select all</Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
                    <Button variant="outline" size="sm" onClick={bulkAddToOther}>Add to Watchlist</Button>
                    <Button variant="destructive" size="sm" onClick={bulkRemove}>Remove</Button>
                  </div>
                </div>
              )}
              {viewMode === 'mosaic' ? (
                <MasonryMediaGrid
                  items={displayFavorites}
                  onRemove={handleRemoveFromFavorites}
                  getMediaTitle={getMediaTitle}
                  getMediaPosterUrl={getMediaPosterUrl}
                  getMediaReleaseYear={getMediaReleaseYear}
                  selectable={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />
              ) : (
                <MediaGrid 
                  title="My Favorites"
                  items={displayFavorites}
                  isLoading={isPreferencesLoading}
                  onRemove={handleRemoveFromFavorites}
                  emptyMessage="You haven't added any favorites yet."
                  emptyAction={<Button asChild><Link href="/">Discover Movies</Link></Button>}
                  getMediaTitle={getMediaTitle}
                  getMediaPosterUrl={getMediaPosterUrl}
                  getMediaReleaseYear={getMediaReleaseYear}
                  viewMode={viewMode as any}
                  selectable={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />
              )}            </TabsContent>

            {/* Collections Tab */}
            <TabsContent value="collections" className="space-y-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCollectionId(c.id)}
                      className={`px-3 py-1 rounded-full border text-sm ${activeCollectionId === c.id ? 'bg-white/10 border-white/30' : 'bg-card/50 border-border/50'}`}
                      style={{ boxShadow: c.color ? `inset 0 0 0 1px ${c.color}55` : undefined }}
                    >
                      {c.name}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const name = prompt('New collection name?');
                      if (!name) return;
                      const color = prompt('Optional color hex (e.g. #e11d48)') || undefined;
                      const created = await createCollection(name, color);
                      setActiveCollectionId(created.id);
                    }}
                  >
                    + New Collection
                  </Button>
                </div>

                {/* Collection Actions */}
                {activeCollectionId && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const col = collections.find(c => c.id === activeCollectionId);
                        if (!col) return;
                        const newName = prompt('Rename collection', col.name);
                        if (!newName) return;
                        await renameCollection(col.id, newName);
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (!confirm('Delete this collection?')) return;
                        const id = activeCollectionId;
                        await deleteCollection(id);
                        setActiveCollectionId(null);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Collection Items */}
              {activeCollectionId ? (
                <MasonryMediaGrid
                  items={collections.find(c => c.id === activeCollectionId)?.items || []}
                  onRemove={(itemId) => removeItemFromCollection(activeCollectionId, itemId)}
                  getMediaTitle={getMediaTitle}
                  getMediaPosterUrl={getMediaPosterUrl}
                  getMediaReleaseYear={getMediaReleaseYear}
                  selectable={selectionMode}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />
              ) : (
                <div className="text-muted-foreground">Create a collection to get started.</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MyList;
